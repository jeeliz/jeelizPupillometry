# Pupillometry in the web browser


This JavaScript library detects, tracks and measures the radius of the 2 pupils of the eyes of the user. It uses a standard 4K webcam and it runs into the web browser, fully client side. It fully uses the GPU hardware acceleration thanks to WebGL, for each computation step : 

* for head detection (using a deep neural network), 
* for iris segmentation (using Circle Hough Transform),
* for Pupil segmentation (using a custom ray tracing algorithm)
* for debug rendering

This library is lightweight : it captures the image of the webcam and gives the relative radiuses of the 2 pupils as output (ie `(radius of the pupil)/(radius of the iris)`. It does not include a measurement recorder or a chart plotter. We want to keep it framework agnostic so it is integrable into all environments. We have included a light plotter and a light recorder among the helper scripts in the `helpers` path for the demonstrations.


## Table of contents
* [Pupillometry](#pupillometry)
* [Features](#features)
* [Architecture](#architecture)
* [Demonstrations](#demonstrations)
* [Hardware](#hardware)
  * [The camera](#the-camera)
  * [The lighting](#the-lighting)
  * [The experimental setup](#the-experimental-setup)
* [Experimental results](#experimental-results)
  * [Light intensity](#light-intensity)
  * [Calm or fear](#calm-or-fear)
* [Specifications](#specifications)
  * [Get started](#get-started)
  * [Optionnal init arguments](#optionnal-init-arguments)
  * [Error codes](#error-codes)
  * [The returned objects](#the-returned-objects)
  * [Miscellaneous methods](#miscellaneous-methods)
* [Hosting](#hosting)
* [About the tech](#about-the-tech)
  * [Under the hood](#under-the-hood)
  * [Compatibility](#compatibility)
* [License](#license)
* [See also](#see-also)
* [References](#references)


## Pupillometry
The pupillometry is the measurement of the radius of the pupil of the eyes. It can depend on several factors :

* the ambient luminosity,
* the state of consciousness (the pupil can dilate with some drugs),
* the mental state (attractivity, liar detection, ...).

This JavaScript library measures the pupillometry in the browser. But it should be used in a rigorous experimental setup : you should use a test sample and a validation sample, you should control the luminosity of the place and you should apply all the rules which makes an experiment a scientific experiment. This measure is not directly usable, and it is always noisy. You should read related scientific publications before implementing any experimental setup.


## Features
Here are the main features of the library :

* face detection,
* face tracking,
* face rotation detection,
* very robust for all lighting conditions,
* video acquisition,
* measurement of the radiuses of the pupils,
* debug view.


## Hardware
We strongly advise to use this library with a desktop or a laptop computer with a dedicated graphic card. Indeed, the video processing is quite heavy and most mobile devices won't be powerful enough. Moreover, a mobile device may move too much and the tracking may be lost from time to time. For our tests, we use a 2015 laptop with a Nvidia GTX960M and Chrome 67 and it works like a charm.

Then we need a very high resolution camera, typically an 4K camera. Indeed, should be able to measure the pupil with a significant amount of pixels. Videoconferencing 4K cameras are not fitted for this purpose because their field of view is too large. We use a 4K CCTV camera with a custom adjustable lens to reduce the field of view. This solution is cheaper, and most CCTV cameras have a big advantage in our case : they does not have a filter to block the infrared and the pupil is more separable from the iris in the infrared field.

We propose a setup until all laptops are equipped with 4K infrared cameras :). You can buy all the parts for about $100 and we expect a decrease in the price of 4K cameras. It is far cheaper than specialized pupillometry devices (some are over $20000). If you succeed in running this library with a lighter setup, we are very interested to add the information here!

You will need small screwdrivers and a bit of common sense to assemble everything. It is easier than building some Ikea furnitures.

### The camera

* The 4K (= 8MP) camera module is a *ELP-USB8MP02G-L75*. [ELP](http://www.elpcctv.com) make great and cheap camera modules, very compliant with Linux drivers. [The specifications are here](http://www.elpcctv.com/8mp-highdefinition-usb-camera-module-usb20-sony-imx179-color-cmos-sensor-75degree-lens-p-223.html) and [you can buy it on Amazon here](https://www.amazon.com/ELP-75degree-8megapixel-Webcams-Industrial/dp/B00WFQOTM2). You can plug this module directly on the USB port,

* A lens for the camera, otherwise the field of view is too large (75 degrees). [You can buy it on Amazon here](https://www.amazon.com/gp/product/B00NVA96ME). Here are its specifications : 
  * Len Type: Manual Iris Lens 
  * Focal Length: 9 ~ 22mm 
  * Imager Size: 1/3" 
  * Mount Type: M12 x 0.5 
  * Aperture Range: F / 1.4 
  * M. O. D: 0.2m 

* A metal case to protect the camera module. [you can buy it on Aliexpress here](https://www.aliexpress.com/item/CCTV-Metal-Mini-Box-Camera-Housing-Case-For-sony-ccd-38x38-AHD-1080P-IP-Cam-PCB/32813579181.html)

* A support a bit heavy like a SmallRig Switching Plate Camera Easy Plate measuring SmallRig Switching Plate Camera Easy Plate : [buy it here on Amazon](https://www.amazon.com/gp/product/B00X5NXSRQ) and do not forget the screws ! [The screws are here on Amazon](https://www.amazon.com/gp/product/B01MS60KSY)

Now, mount all the stuffs to get a powerful 4K infrared enabled camera :

* take the camera module and remove the screws fixing the plastic lens support. After that, the CMOS captor should be naked on the electronic board [like in this picture](/images/hardware/cameraNoLens.jpg). Note : you can also directly buy the ELP camera module without the lens [(ref : ELP-USB8MP02G)](http://www.elpcctv.com/8megapixel-usb-camera-module-usb20-sony-imx179-color-cmos-sensor-p-222.html). Be very careful : DO NOT PUT YOUR FINGERS ON THE CMOS CAPTOR ! And do the operation in a dust free environment.

* put the camera module into the metal case and close it using the provided screws,

* screw the lens to the camera module. Screw the metal case handle. Be careful : there are short and long screws, the long are used to fix the handle.

* fix the metal case handle to the cheese plate rig. The central hole is too small for the small rig screws. You can either enlarge it if you have the appropriate tool, or fixing the handle by putting 2 screws on each side to fix it.

You can found a [picture of the mounted camera here](/images/setup/camera.jpg).


### The lighting
The light should be red because the pupils do not contract on red light. A light from below is great because it won't make reflections on the pupil like a direct one, and the eyelids will not make shadows.

* a clip light with a reflector is perfect (Bulb E26, up to 60 Watts, with a 8.5 inch aluminium reflector ). You can [buy it on Amazon here](https://www.amazon.com/Simple-Deluxe-Aluminum-Reflector-Listed/dp/B01E9IY6US),

* a red bulb [like this one](https://www.amazon.com/Westinghouse-0441000-Watt-Incandescent-Light/dp/B0000BYBV0).


### The experimental setup
![Experimental setup](images/setup/setup.jpg?raw=true "Experimental setup")

The total cost of all this hardware (camera + 1 light) is `(59.99+14.48+6+9.99+5.99)+(8.99+7.04) = $112.48` and most of the hardware is reusable for other projects.

The ideal position for the camera is centered horizontally, and below the head, looking up. Place it at the bottom of the screen if it is possible. Avoid to put the camera too high: it will then look down and the eyelids will mask the eyes. On contrary, if the camera is looking up, it would not be bothered by eyelids.

Avoid any front lighting : it makes reflections on the pupil and it disturbs the pupil radius detection algorithm. The best place is on a desktop or a table facing a wall without windows or lights on it.

Fix the lights on the deskop using the clips, one a each side of the user. Then launch the demonstration provided in this repository. You start in the Debug view. This view is important for calibration and it shows the 3 levels of detection :
* The global face detection using a neural network,
* The iris segmentation using circle hough transform,
* The pupil radius measurement using a custom ray tracing algorithm.

Do the following operations to ajust consecutively the 3 levels of detection :

* Check that the camera used is the 4K camera and not the small laptop camera,
* Put your head in front of the computer, not too close to the camera,
* Adjust the lens (2 settings : zoom and focus) in order to have an image not blurry (the edge border detection in red can help you to find a good setting),
* The face image should be centered and your face should be detected,
* Adjust the 3 first sliders about the Iris detection and segmentation. At the end the Iris should be detected and cropped correctly. The result should be stabilized,
* Adjust the lighting (the red lights position) so that the pupil should be black, without too strong reflections, and the iris should be sufficiently illuminated to be separable from the pupil. You can also play with the camera settings (with Linux/Debian, launch `v4l2ucp /dev/video1` and replace automatic exposure with manual one. [This a screenshot of our settings](/images/screenshots/v4l2ucp.png)),
* Adjust the last slider, the *Pupil detect sensitivity*. The detection of the pupil is shown by a lime circle on the iris view.

The detection works better without wearing glasses. If you still have to wear it, they should be very clean in order to not disturb the pupil detection.


## Architecture

* `/demos/`: source code of demonstrations,
* `/dist/`: heart of the library: 
  * `jeelizPupillometry.js`: main minified script,
  * `jeelizPupillometryNNC.json`: file storing the neural network parameters, loaded by the main script,
* `/helpers/`: scripts which can help you to use this library (chart plotters, measurement recorders...),
* `/images/` : some nice pics of good hardware, good setup and screenshots,
* `/libs/`: 3rd party libraries


## Demonstrations

You can test it with these demos (all included in this repository in the `/demos` directory). You will find among them the perfect starting point to build your own face based augmented reality application :

* [measure the dilation of the pupil by varying the luminous intensity of the screen](https://jeeliz.com/demos/pupillometry/demos/lightIntensity/)

* [measure the dilatation of the pupil when looking alternately images inspiring peace or fear](https://jeeliz.com/demos/pupillometry/demos/warPeace/)


If you have not bought the required hardware yet, a screenshot video is available [on Youtube](https://youtu.be/jQkaJoMGinQ). You can also subscribe to the [Jeeliz Youtube channel](https://www.youtube.com/channel/UC3XmXH1T3d1XFyOhrRiiUeA) or to the [@StartupJeeliz Twitter account](https://twitter.com/StartupJeeliz) to be kept informed of our cutting edge developments.

If you have developped an application or a demonstration using this library, we would love to see it and add a link here ! Just contact us on [Twitter @StartupJeeliz](https://twitter.com/StartupJeeliz) or [LinkedIn](https://www.linkedin.com/company/jeeliz).


## Experimental results

### Light intensity
We have measured the dilatation of the pupil over 25 epochs. At each epoch the screen is black during 2000ms, then white during 2000ms. This is the first demonstration, [included in this repository here](/demos/lightIntensity/) and available [hosted on jeeliz.com here](https://jeeliz.com/demos/pupillometry/demos/lightIntensity/).

Then we have normalized the pupil radius by its initial value for each epoch. A Hampel filter has been applied to remove outliers. We have averaged the values over the 25 epoch. Here is the result for the left and right pupils :
![Light intensity experimental result](demos/lightIntensity/results/result_avg.png?raw=true "Light intensity experimental result")

The pupil dilates (its radius increases) when the luminosity decreases.


### Calm or fear
We have measured the dilatation of the pupil over 5 epochs. At each epoch a quiet, peaceful image (a desert beach, or a beautiful landscape...) is shown during 4000ms, then an image inspiring fear is shown during the same duration (a war or a riot picture for example).

![Calm of fear experimental result](demos/warPeace/results/result_avg.png?raw=true "Calm of fear experimental result")

This result was previously observed in [Snowden RJ, O’Farrell KR, Burley D, Erichsen JT, Newton NV, Gray NS. The pupil’s response to affective pictures: Role of image duration, habituation, and viewing mode. Psychophysiology. 2016;53(8):1217-1223. doi:10.1111/psyp.12668.](doc/calmOrFear.pdf) : The pupil dilates when we feel fear.


## Specifications
Here we describe how to use this library. You can take a look at the [light intensity demo](/demos/lightIntensity) to have a concrete example.

### Get started
On your HTML page, you first need to include the main script between the tags `<head>` and `</head>` :
```html
 <script type="text/javascript" src="dist/jeelizPupillometry.js"></script>
```
Then you should include a `<canvas>` HTML element in the DOM, between the tags `<body>` and `</body>`. This canvas will be used both for computations and debug rendering. The `width` and `height` properties of the canvas element should be set. They define the resolution of the canvas and the final rendering will be computed using this resolution. Be careful to not enlarge too much the canvas size using its CSS properties without increasing its resolution, otherwise it may look blurry or pixelated. We advise to fix the resolution to the actual canvas size. Do not forget to call `JEEPUPILAPI.resize()` if you resize the canvas after the initialization step. We strongly encourage you to use our helper `/helpers/JeelizResizer.js` to set the width and height of the canvas (see [Optimization/Canvas and video resolutions](#optimization) section).
```html
<canvas width="1024" height="1024" id='jeePupilCanvas'></canvas>
```
When your page is loaded you should launch this function :
```javascript
JEEPUPILAPI.init({
    canvasId: 'jeePupilCanvas',
    NNCpath: '../../../dist/', //path to JSON neural network model (jeelizPupillometryNNC.json by default)
    callbackReady: function(errCode, spec){
        if (errCode){
            console.log('AN ERROR HAPPENS. ERROR CODE =', errCode);
            return;
        }
        [init scene with spec...]
        console.log('INFO: JEEPUPILAPI IS READY');
    }, //end callbackReady()

    //called at each measurement (drawing loop)
    callbackTrack: function(detectState){
        [... do something with detectState]
    } //end callbackTrack()
});//end init call
```


### Optionnal init arguments
* `<integer> animateDelay`: It is used only in normal rendering mode (not in slow rendering mode). With this statement you can set accurately the number of milliseconds during which the browser wait at the end of the rendering loop before starting another detection. If you use the canvas of this API as a secondary element (for example in *PACMAN* or *EARTH NAVIGATION* demos) you should set a small `animateDelay` value (for example 2 milliseconds) in order to avoid rendering lags.
* `<function> onWebcamAsk`: Function launched just before asking for the user to allow its webcam sharing,
* `<function> onWebcamGet`: Function launched just after the user has accepted to share its video. It is called with the video element as argument,
* `<dict> videoSetting`: override WebRTC specified video settings, which are by default :
```javascript
{
  'videoElement' //not set by default. <video> element used
   //If you specify this parameter,
   //all other settings will be useless
   //it means that you fully handle the video aspect

  'deviceId'           //not set by default
  'idealWidth': 3264,  //ideal video width in pixels (4K)
  'idealHeight': 2448, //ideal video height in pixels (4K)
  'maxWidth': 7680,    //max video width in pixels (8K)
  'maxHeight': 4320,   //max video height in pixels (8K)
  'minWidth': 1920,    //min video width in pixels (HD)
  'minHeight': 1080,   //min video height in pixels (HD)
}
```


### Error codes
The initialization function ( `callbackReady` in the code snippet ) will be called with an error code ( `errCode` ). It can have these values :
* `false`: no error occurs,
* `"GL_INCOMPATIBLE"`: WebGL is not available, or this WebGL configuration is not enough (there is no WebGL2, or there is WebGL1 without OES_TEXTURE_FLOAT or OES_TEXTURE_HALF_FLOAT extension),
* `"ALREADY_INITIALIZED"`: the API has been already initialized,
* `"NO_CANVASID"`: no canvas ID was specified,
* `"INVALID_CANVASID"`: cannot found the `<canvas>` element in the DOM,
* `"INVALID_CANVASDIMENSIONS"`: the dimensions `width` and `height` of the canvas are not specified,
* `"WEBCAM_UNAVAILABLE"`: cannot get access to the webcam (the user has no webcam, or it has not accepted to share the device, or the webcam is already busy),
* `"GLCONTEXT_LOST"`: The WebGL context was lost. If the context is lost after the initialization, the `callbackReady` function will be launched a second time with this value as error code.


### The returned objects
We explain the arguments of the callback functions like `callbackReady` or `callbackTrack`. The reference of these objects do not change for memory optimization purpose. So you should copy their property values if you want to keep them unchanged outside the callback functions scopes.

#### The initialization returned object
The initialization callback function ( `callbackReady` in the code snippet ) is called with a second argument, `spec`, if there is no error. `spec` is a dictionnary having these properties :
* `GL`: the WebGL context. The rendering 3D engine should use this WebGL context,
* `canvasElement`: the `<canvas>` element,
* `videoTexture`: a WebGL texture displaying the webcam video. It matches the dimensions of the canvas. It can be used as a background

#### The detection state
At each render iteration a callback function is executed ( `callbackTrack` in the code snippet ). It has one argument ( `detectState` ) which is a dictionnary with these properties :
* `detected`: the face detection probability, between `0` and `1`,
* `x`, `y`: The 2D coordinates of the center of the detection frame in the viewport (each between -1 and 1, `x` from left to right and `y` from bottom to top),
* `s`: the scale along the horizontal axis of the detection frame, between 0 and 1 (1 for the full width). The detection frame is always square,
* `rx`, `ry`, `rz`: the Euler angles of the head rotation in radians,
* `pupilLeftRadius` and `pupilRightRadius` : the most important values! The relative radius of the left and the right pupils. Each value is equals to `<pupilRadius>/<irisRadius>`.


### Miscellaneous methods
After the initialization (ie after that `callbackReady` is launched ) , these methods are available :

* `JEEPUPILAPI.resize()`: should be called after resizing the `<canvas>` element to adapt the cut of the video,

* `JEEPUPILAPI.toggle_pause(<boolean> isPause)`: pause/resume,

* `JEEPUPILAPI.toggle_slow(<boolean> isSlow)`: toggle the slow rendering mode: because this API consumes a lot of GPU resources, it may slow down other elements of the application. If the user opens a CSS menu for example, the CSS transitions and the DOM update can be slow. With this function you can slow down the rendering in order to relieve the GPU. Unfortunately the tracking and the 3D rendering will also be slower but this is not a problem is the user is focusing on other elements of the application. We encourage to enable the slow mode as soon as a the user's attention is focused on a different part of the canvas,

* `JEEPUPILAPI.set_animateDelay(<integer> delay)`: Change the `animateDelay` (see `init()` arguments).



## Hosting
This API requires the user's webcam video feed through `MediaStream API`. So your application should be hosted by a HTTPS server (even with a self-signed certificate). It won't work at all with unsecure HTTP, even locally with some web browsers.

It is served through a content delivery network (CDN) using gzip compression.
If you host the scripts by yourself, be careful to enable gzip HTTP/HTTPS compression for JSON and JS files. Indeed, the neuron network JSON file, `dist/jeelizPupillometryNNC.json` is quite heavy, but very well compressed with GZIP. You can check the gzip compression of your server [here](https://checkgzipcompression.com/).


## About the tech
### Under the hood
This library relies on Jeeliz WebGL Deep Learning technology to detect and track the user's face using a neural network. The accuracy is adaptative: the best is the hardware, the more detections are processed per second. All is done client-side.

After the face has been detected, it is tracked using a sliding window. The areas matching the eyes are cut. Then a circle hough transform is applied to detect the iris parameters (radius and position of the center).

The iris are cropped and a custom ray tracing algorithm estimates the center and the radius of the pupil.

### Compatibility
* If `WebGL2` is available, it uses `WebGL2` and no specific extension is required,
* If `WebGL2` is not available but `WebGL1`, we require either `OES_TEXTURE_FLOAT` extension or `OES_TEXTURE_HALF_FLOAT` extension,
* If `WebGL2` is not available, and if `WebGL1` is not available or neither `OES_TEXTURE_FLOAT` or `OES_HALF_TEXTURE_FLOAT` are implemented, the user is not compatible.

In all cases, WebRTC should be implemented in the web browser, otherwise it won't be possible to get the webcam video feed. Here are the compatibility tables from [caniuse.com](https://caniuse.com/) here: [WebGL1](https://caniuse.com/#feat=webgl), [WebGL2](https://caniuse.com/#feat=webgl2), [WebRTC](https://caniuse.com/#feat=stream).

If a compatibility error is triggered, please post an issue on this repository. If this is a problem with the webcam access, please first retry after closing all applications which could use your device (Skype, Messenger, other browser tabs and windows, ...). Please include :
* a screenshot of [webglreport.com - WebGL1](http://webglreport.com/?v=1) (about your `WebGL1` implementation),
* a screenshot of [webglreport.com - WebGL2](http://webglreport.com/?v=2) (about your `WebGL2` implementation),
* the log from the web console,
* the steps to reproduce the bug, and screenshots.


## License
[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0.html). This application is free for both commercial and non-commercial use.

We appreciate attribution by including the [Jeeliz logo](https://jeeliz.com/wp-content/uploads/2018/01/LOGO_JEELIZ_BLUE.png) and a link to the [Jeeliz website](https://jeeliz.com) in your application or desktop website. Of course we do not expect a large link to Jeeliz over your face filter, but if you can put the link in the credits/about/help/footer section it would be great.


## See also
Jeeliz main face detection and tracking library is called [Jeeliz FaceFilter API](https://github.com/jeeliz/jeelizFaceFilter). It handles multi-face detection, and for each tracked face it provides the rotation angles and the mouth opening factor. It is perfect to build your own Snapchat/MSQRD like face filters running in the browser. It comes with dozen of integration demo, including a face swap.

Our newest deep learning based library is called *Weboji*. It detects 11 facial expressions in real time from the webcam video feed. Then they are reproduced on an avatar, either in 3D with a THREE.JS renderer or in 2D with a SVG renderer (so you can use it even if you are not a 3D developer). You can access to the github repository [here](https://github.com/jeeliz/jeelizWeboji).

If you just want to detect if the user is looking at the screen or not, [Jeeliz Glance Tracker](https://github.com/jeeliz/jeelizGlanceTracker) is what you are looking for. It can be useful to play and pause a video whether the user is watching or not. This library needs fewer resources and the neural network file is much lighter.

If you want to use this library for glasses virtual try-on (sunglasses, spectacles, ski masks), you can take a look at [Jeeliz VTO widget](https://github.com/jeeliz/jeelizGlassesVTOWidget). It includes a high quality and lightweight 3D engine which implements the following features: deferred shading, PBR, raytraced shadows, normal mapping, ... It also reconstructs the lighting environment around the user (ambient and directional lighting). But the glasses comes from a database hosted in our servers. If you want to add some models, please contact us.


## References
* [Jeeliz official website](https://jeeliz.com)
* [Webgl Academy: tutorials about WebGL and THREE.JS](http://www.webglacademy.com)