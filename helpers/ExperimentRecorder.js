/*
  Records the results of an experiments
  (in general the pupils radiuses and the timestamps of each value)

  it requires plotly.js to trace the graph
*/
var ExperimentRecorder = (function(){
  // private vars:
  const _record = [];
  let _isRunning = false, _ts0 = null;

  // private funcs:
  function getTime(){  // returns current time in seconds since the beginning of the recording
    return (Date.now()-_ts0) / 1000.0;
  }

  function getDuration(){
    if (_record.length<=2) return 0;
    return _record[_record.length-1].ts - _record[0].ts;
  }

  function getValues(){
    return _record.filter(function(rec){
      return rec.type === 'VAL';
    })
  }

  function getEvents(){
    return _record.filter(function(rec){
      return rec.type === 'EVENT';
    })
  }

  function getValKeys(){
    const keys = [];
    getValues().forEach(function(val){
      Object.keys(val.val).forEach(function(key){
        if (keys.indexOf(key)===-1){
          keys.push(key);
        }
      });
    });
    return keys;
  }

  function cloneRec(v){
    return {
      type: 'VAL',
      ts: v.ts,
      val: v.val
    };
  }

  // public methods:
  const that = {
    addValue: function(value){
      if (!_isRunning){
        return;
      }
      _record.push({
        type: 'VAL',
        val: value,
        ts: getTime()
      });
    },

    addEvent: function(label){
      _record.push({
        type: 'EVENT',
        label: label,
        ts: getTime()
      });
    },  

    start: function(){ // clear all values and start
      _isRunning = true;
      _record.splice(0, _record.length);
      _ts0 = Date.now();
    },

    end: function(){ // called when the experiment is over
      // be sure that values are sorted from older to newer:
      _record.sort(function(recA, recB){
        return recA.ts-recB.ts;
      });

      _isRunning = false;
    },

    group_byEventLabels: function(eventLabels){
      // initialization of returned object
      const result = {};
      eventLabels.forEach(function(eventLabel){
        result[eventLabel] = [];
      })

      // sort values by event type
      let lastEvent = null, currentGroup =  null;

      _record.forEach(function(rec){
        if (rec.type==='EVENT'){
          const eventIndex = eventLabels.indexOf(rec.label);
          if (eventIndex!==-1){ // this event is taken into account by the grouping
            if (currentGroup!==null && currentGroup.length){ // first save previous session
              result[lastEvent.label].push(currentGroup);
            }
            currentGroup = [];
            lastEvent = rec;
          }
        } else if (currentGroup!==null && rec.type==='VAL'){
          const recCloned = cloneRec(rec);
          recCloned.ts -= lastEvent.ts;
          currentGroup.push(recCloned);
        }
      }); //end loop on records

      if (currentGroup!==null && currentGroup.length){
        result[lastEvent.label].push(currentGroup);
      }

      return result;
    }, //end group_byEventLabels()

    normalize_byFirstValue: function(recs){
      const firstVal = recs[0].val;
      const keys = Object.keys(firstVal);

      return recs.map(function(rec){
        const normalizedRec = cloneRec(rec);
        const normalizedVal = {};
        keys.forEach(function(key){
          normalizedVal[key] = rec.val[key] / firstVal[key];
        })
        normalizedRec.val = normalizedVal;
        return normalizedRec;
      });
    },

    filter_hampel: function(recs, thres, halfWindowSize) { // apply an Hampel filter on the values. cf https://link.springer.com/article/10.1186/s13634-016-0383-6
      const keys = Object.keys(recs[0].val);

      return recs.map(function(rec, recIndex){
        // extract the sliding window:
        let beginIndex = recIndex-halfWindowSize, endIndex = recIndex+halfWindowSize+1;
        if (beginIndex<0){
          endIndex -= beginIndex;
          beginIndex = 0;
        } else if (endIndex>recs.length){
          const di = endIndex - recs.length;
          endIndex = recs.length;
          beginIndex -= di;
        }
        const slidingWin = recs.slice(beginIndex, endIndex);

        keys.forEach(function(key){
          // compute the median value for this key over the sliding window:
          slidingWin.sort(function(recA, recB){
            return recA.val[key] - recB.val[key];
          });
          const medianVal = slidingWin[halfWindowSize].val[key];

          // compute Hampel filter Sk term (see  https://link.springer.com/article/10.1186/s13634-016-0383-6)
          const slidingWinMedianEcart = slidingWin.map(function(slidingRec){
            return Math.abs(slidingRec.val[key] - medianVal);
          });
          slidingWinMedianEcart.sort(function(a, b){
            return a - b;
          });
          const Sk = slidingWinMedianEcart[halfWindowSize];

          // compare the rec value with the median:
          const dMedian = Math.abs(medianVal-rec.val[key]);
          if (dMedian > thres*1.4826*Sk){
            console.log('INFO in ExperimentRecorder.filter_hampel(): replace ', rec.val[key], 'by', medianVal);
            rec.val[key] = medianVal;
          }
        });
      });
    }, //end filter_hampel()

    resample: function(values, duration, period){
      const nSamples = Math.round(duration/period) + 1; // number of samples after resampling
      let realPeriod = duration / (nSamples-1);
      realPeriod /= 1000; // convert MS to S
      const resampled = new Array(nSamples);
      let resampledVal = null;
      for (let i=0; i<nSamples; ++i){
        const t = i * realPeriod; // time

        // search for value before, after, and at the same time:
        let valBefore = null, valAfter = null, valSameTime = null;
        values.forEach(function(val){ // browse from older to newer
          if (valAfter){
            return;
          }
          if (val.ts===t){
            valSameTime = val;
            return;
          }
          if (val.ts<t){
            valBefore = val;
            return;
          }
          if (val.ts>t){
            valAfter = val;
            return;
          }
        }); //end loop on values

        if (valSameTime){
          resampledVal = valSameTime.val;
        } else if(valBefore && !valAfter){
          resampledVal = valBefore.val;
        } else if (valAfter && !valBefore){
          resampledVal = valAfter.val;
        } else { // linear interpolation between valBefore and valAfter
          const dt = valAfter.ts - valBefore.ts;
          const kAfter = (t - valBefore.ts) / dt;

          resampledVal = {};
          Object.keys(valBefore.val).forEach(function(key){
            resampledVal[key] = kAfter*valAfter.val[key] + (1-kAfter)*valBefore.val[key];
          });
        }

        resampled[i] = {
          ts: t,
          type: 'VAL',
          val: resampledVal
        }
      } //end loop on resampled values
      return resampled;
    }, //end resample

    average_resampleds: function(resampleds){
      const nAvg = resampleds.length;
      return resampleds[0].map(function(rec, valIndex){
        const avgVal = {};
        Object.keys(rec.val).forEach(function(key){
          avgVal[key] = 0;
          resampleds.map(function(serie){
            avgVal[key] += serie[valIndex].val[key];
          });
          avgVal[key] /= nAvg;
        });
        return {
          ts: rec.ts,
          type: 'VAL',
          val: avgVal
        }
      });
    },

    plot_averages: function(averages){
      const plots = [];
      Object.keys(averages).forEach(function(label){
        const recs = averages[label];
        if (!recs.length) return;

        const timestamps = recs.map(function(rec){
          return rec.ts;
        });
        
        const valKeys = Object.keys(recs[0].val);
        valKeys.forEach(function(valKey){
          const vals = recs.map(function(rec){
            return rec.val[valKey];
          });

          plots.push({
            name: label + '_' + valKey,
            x: timestamps,
            y: vals,
            type: 'scatter'
          });
        }); //end loop on valkeys
      }); //end loop on labels
      Plotly.newPlot('resultsAvg-plot', plots);
    },

    plot: function(){ // use plotly.js to trace the graph (cf https://plot.ly/javascript/line-charts/)
      const duration = getDuration();
      if (!duration) return;

      const plots = getValKeys().map(function(key){
        const timestamps = [], vals = [];
        getValues().forEach(function(val){
          if (!val.val[key]) return;
          vals.push(val.val[key]);
          timestamps.push(val.ts);
        });
        return {
          name: key,
          x: timestamps,
          y: vals,
          type: 'scatter'
        }
      });

      const traceEventLabels = {
        x: [],
        y: [],
        mode: 'text',
        text: [],
        showlegend: false
      };
      plots.push(traceEventLabels);

      const eventColors = ['red', 'green', 'blue', 'yellow'];
      const eventLabel2ColorMap = {};
      const shapes = getEvents().map(function(event){
        // event label:
        traceEventLabels.text.push(event.label);
        traceEventLabels.x.push(event.ts);
        traceEventLabels.y.push(0);

        // event vertical line color:
        let color = eventLabel2ColorMap[event.label];
        if (!color){
          color = eventColors.shift();
          if (!color){
            color = 'grey';
          }
          eventLabel2ColorMap[event.label] = color;
        }

        // event vertical line:
        return {
          name: event.label,
          type: 'line',
          x0: event.ts,
          y0: 0,
          x1: event.ts,
          yref: 'paper',
          y1: 1,
          line: {
            color: color,
            width: 1.5,
            dash: 'dot'
          }
        }
      });
      
      const layout = {
        shapes: shapes
      };

      Plotly.newPlot('results-plot', plots, layout);
    } //end plot()
  }; //end that
  return that;
})();
