"use strict";
/*
	Records the results of an experiments
	(in general the pupils radiuses and the timestamps of each value)

	it requires plotly.js to trace the graph
*/
var ExperimentRecorder=(function(){
	//private vars :
	var _record=[], _isRunning=false, _ts0;

	//private funcs :
	function getTime(){  //return current time in seconds since the beginning of the recording
		return (Date.now()-_ts0)/1000.0;
	}

	function getDuration(){
		if (_record.length<=2) return 0;
		return _record[_record.length-1].ts-_record[0].ts;
	}

	function getValues(){
		return _record.filter(function(rec){
			return rec.type==='VAL';
		})
	}

	function getEvents(){
		return _record.filter(function(rec){
			return rec.type==='EVENT';
		})
	}

	function getValKeys(){
		var keys=[];
		getValues().forEach(function(val){
			Object.keys(val.val).forEach(function(key){
				if (keys.indexOf(key)===-1){
					keys.push(key);
				}
			});
		});
		return keys;
	}

	//public methods :
	var that={
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

		start: function(){ //clear all values and start
			_isRunning=true;
			_record.splice(0, _record.length);
			_ts0=Date.now();
		},

		end: function(){ //called when the experiment is over
			_isRunning=false;
		},

		plot: function(){ //use plotly.js to trace the graph (cf https://plot.ly/javascript/line-charts/)
			var duration=getDuration();
			if (!duration) return;

			var plots=getValKeys().map(function(key){
				var timestamps=[], vals=[];
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

			var traceEventLabels={
				x: [],
				y: [],
				mode: 'text',
				text: [],
				showlegend: false
			};
			plots.push(traceEventLabels);

			var eventColors=['red', 'green', 'blue', 'yellow'];
			var eventLabel2ColorMap={};
			var shapes=getEvents().map(function(event){
				//event label :
				traceEventLabels.text.push(event.label);
				traceEventLabels.x.push(event.ts);
				traceEventLabels.y.push(0);

				//event vertical line color :
				var color=eventLabel2ColorMap[event.label];
				if (!color){
					color=eventColors.shift();
					if (!color){
						color='grey';
					}
					eventLabel2ColorMap[event.label]=color;
				}

				//event vertical line :
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
			
			var layout = {
			  shapes: shapes
			};

			Plotly.newPlot('results-plot', plots, layout);
		} //end plot()
	}; //end that
	return that;
})();
