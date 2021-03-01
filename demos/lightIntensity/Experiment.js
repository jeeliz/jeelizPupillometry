"use strict";

/*
This script encodes the experiement
*/ 

var Experiment = (function(){
  // experiment settings:
  const _settings = {
    faceDetectedThreshold: 0.5, // between 0 (easy detection) and 1 (hard detection)
    nIterations: 25, // number of iterations black -> white
    delay: 2000, // delay between 2 luminosity changes in ms
    resamplePeriod: 20 // used for measures time resampling (we need to resample the time to average values). In ms
  };

  // private vars:
  let _domButton = null, _domScreen = null;
  let _isRunning = false, _cyclesCounter = 0, _detectedState = null;

  // private funcs:
  function cycle(){
    if (!_isRunning) return;
    if (_cyclesCounter === 2*_settings.nIterations){ // experience is over
      complete();
      return;
    }

    if (_cyclesCounter%2 === 0){ // black screen
      _domScreen.style.backgroundColor = 'black';
      ExperimentRecorder.addEvent('BLACK');
    } else { // white screen
      _domScreen.style.backgroundColor = 'white';
      ExperimentRecorder.addEvent('WHITE');
    }

    ++_cyclesCounter;
    setTimeout(cycle, _settings.delay);
  }

  function setCSSdisplay(domId, val){
    const domElt = document.getElementById(domId);
    domElt.style.display = val;
  }

  function complete(){ // experience is complete (not aborted or canceled)
    console.log('INFO in Experiment.js: experiment is complete :)');

    that.stop();
    ExperimentRecorder.plot(); // trace RAW RESULTS

    // compute and trace AVG RESULTS:
    const groupedValues = ExperimentRecorder.group_byEventLabels(['WHITE', 'BLACK']);
    const avgs = {};
    ['WHITE', 'BLACK'].forEach(function(groupLabel){
      groupedValues[groupLabel] = groupedValues[groupLabel].map(function(sample){
        ExperimentRecorder.filter_hampel(sample, 0.5, 2);
        const sampleNormalized = ExperimentRecorder.normalize_byFirstValue(sample);
        return ExperimentRecorder.resample(sampleNormalized, _settings.delay, _settings.resamplePeriod);
      });

      const averageValues = ExperimentRecorder.average_resampleds(groupedValues[groupLabel]);
      avgs[groupLabel] = averageValues;
    });
    // plot average:
    ExperimentRecorder.plot_averages(avgs);

    // Some CSS & UI stuffs:
    TabManager.open('tabLink-results', 'tabContent-results');
    setCSSdisplay('results-noResults', 'none');
    setCSSdisplay('results-caption', 'block');
    setCSSdisplay('results-plot', 'inline-block');  

    setCSSdisplay('resultsAvg-noResults', 'none');
    setCSSdisplay('resultsAvg-caption', 'block');
    setCSSdisplay('resultsAvg-plot', 'inline-block');  
  }

  function addValue(){
    ExperimentRecorder.addValue({
      pupilLeftRadius: _detectedState.pupilLeftRadius,
      pupilRightRadius: _detectedState.pupilRightRadius
    });
  }

  function callbackTrack(detectedState){
    _detectedState = detectedState;
    
    if (!_isRunning){
      return;
    }

    const isFaceDetected = (detectedState.detected>_settings.faceDetectedThreshold);
    if (0 && !isFaceDetected){
      that.stop();
      alert('ERROR: the face is not detected. Please take a look in the debug view. The experiment has been aborted.');
      return;
    }

    addValue();
    return;
  }

  // public methods:
  const that = {
    init: function(){ // entry point. Called by body onload method
      // initialize Jeeliz pupillometry:
      JEEPUPILAPI.init({
        canvasId: 'jeePupilCanvas',
        NNCPath: '../../dist/',
        callbackReady: function(err){
          if (err){
              console.log('AN ERROR HAPPENS. ERR =', err);
              return;
          }

          console.log('INFO: JEEPUPILAPI IS READY');
        },
        callbackTrack: callbackTrack
      });
      _domButton = document.getElementById('experiment-stopStartButton');
      _domScreen = document.getElementById('experiment-screen');
    },

    toggle: function(){
      if (_isRunning){
        that.stop();
      } else {
        that.start();
      }
    },

    start: function(){
      if (_isRunning){
        console.log('WARNING in Experiment.js - start(): the experiment is running. Stop it before running this method.');
        return;
      }
      _isRunning = true;
      _domButton.innerHTML = 'STOP THE EXPERIMENT';
      _domScreen.style.display = 'block';
      _cyclesCounter = 0;
      ExperimentRecorder.start();
      addValue(); // add the first value
      cycle();
    },

    stop: function(){
      if (!_isRunning){
        console.log('WARNING in Experiment.js - stop(): the experiment is not running. Start it before running this method.');
        return;
      }
      _isRunning = false;
      _domButton.innerHTML = 'START THE EXPERIMENT';
      _domScreen.style.display = 'none';
      ExperimentRecorder.end();
    }
  } //end that
  return that;
})();
