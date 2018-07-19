"use strict";

/*
This script encodes the experiement
*/ 

var Experiment=(function(){
	//experiment settings :
	var _settings={
		faceDetectedThreshold: 0.5, //between 0 (easy detection) and 1 (hard detection)
		nIterations: 2,//25, //number of iterations black -> white
		delay: 2000 //delay between 2 luminosity changes in ms
	};

	//private vars :
	var _domButton, _domScreen, _isRunning=false, _cyclesCounter=0;

	//private funcs :
	function cycle(){
		if (!_isRunning) return;
		if (_cyclesCounter===2*_settings.nIterations){ //experience is over
			complete();
			return;
		}

		if (_cyclesCounter%2===0){ //black screen
			_domScreen.style.backgroundColor='black';
			ExperimentRecorder.addEvent('BLACK');
		} else { //white screen
			_domScreen.style.backgroundColor='white';
			ExperimentRecorder.addEvent('WHITE');
		}

		++_cyclesCounter;
		setTimeout(cycle, _settings.delay);
	}

	function setCSSdisplay(domId, val){
		var domElt=document.getElementById(domId);
		domElt.style.display=val;
	}

	function complete(){ //experience is complete (not aborted or canceled)
		that.stop();
		ExperimentRecorder.plot();
		TabManager.open('tabLink-results', 'tabContent-results');
		setCSSdisplay('results-noResults', 'none');
		setCSSdisplay('results-caption', 'block');
		setCSSdisplay('results-plot', 'inline-block');	
	}

	function callbackTrack(detectedState){
		if (!_isRunning){
			return;
		}

		var isFaceDetected=(detectedState.detected>_settings.faceDetectedThreshold);
		if (!isFaceDetected){
			that.stop();
			alert('ERROR : the face is not detected. Please take a look in the debug view. The experiment has been aborted.');
			return;
		}

		ExperimentRecorder.addValue({
			pupilLeftRadius: detectedState.pupilLeftRadius,
			pupilRightRadius: detectedState.pupilRightRadius
		});
		return;
	}

	//public methods :
	var that = {
		init: function(){ //entry point. Called by body onload method
			//initialize Jeeliz pupillometry :
			JEEPUPILAPI.init({
                canvasId: 'jeePupilCanvas',
                NNCpath: '../../dist/',
                callbackReady: function(err){
                    if (err){
                        console.log('AN ERROR HAPPENS. ERR =', err);
                        return;
                    }

                    console.log('INFO : JEEPUPILAPI IS READY');
                },
                callbackTrack: callbackTrack
            });
			_domButton=document.getElementById('experiment-stopStartButton');
			_domScreen=document.getElementById('experiment-screen');
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
				console.log('WARNING in Experiment.js - start() : the experiment is running. Stop it before running this method.');
				return;
			}
			_isRunning=true;
			_domButton.innerHTML='STOP THE EXPERIMENT';
			_domScreen.style.display='block';
			_cyclesCounter=0;
			ExperimentRecorder.start();
			cycle();
		},

		stop: function(){
			if (!_isRunning){
				console.log('WARNING in Experiment.js - stop() : the experiment is not running. Start it before running this method.');
				return;
			}
			_isRunning=false;
			_domButton.innerHTML='START THE EXPERIMENT';
			_domScreen.style.display='none';
			ExperimentRecorder.end();
		}
	} //end that
	return that;
})();
