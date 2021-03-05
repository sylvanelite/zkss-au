//to run with CGI: python -m http.server --bind localhost --cgi 8000
//https://stackoverflow.com/questions/4139170/bind-httserver-to-local-ipport-so-that-others-in-lan-can-see-it
//      python -m http.server 8888 --bind 0.0.0.0 --cgi - then view on <ip>:8888


import Au from "./js/globals.mjs";
import StateLobby from "./js/state_lobby.mjs";
import StateMainMenu from "./js/state_main_menu.mjs";
import StateMeeting from "./js/state_meeting.mjs";
import StatePlaying from "./js/state_playing.mjs";
import StateTask from "./js/state_task.mjs";
import StateViewLog from "./js/state_view_log.mjs";


import ClientMiddleware from "./js/middleware_client.mjs";
import EventProcessor from "./js/event_processor.mjs";


//entry point, assign ID and initial state
Au.init = function(){
    //assign a playerId
    Au.varPlayerId = Au.getRandomString(50);
    //generate the main game logic
    Au.middleware = new ClientMiddleware();
    let processor = new EventProcessor(Au.middleware);
    Au.processor = processor;
    //set up states
    Au.states = {};
    Au.states.stateLobby = new StateLobby();
    Au.states.stateMainMenu = new StateMainMenu();
    Au.states.stateMeeting = new StateMeeting();
    Au.states.statePlaying = new StatePlaying();
    Au.states.stateTask = new StateTask();
    Au.states.stateViewLog = new StateViewLog();
    
    for (const state of Object.values(Au.states)) {
      state.init();
      state.hide();
    }

    Au.state = Au.states.stateMainMenu;
    //starts the main loops running
    Au.renderLoop();
    
    $(window).on("resize",function(){
        if(Au.hasOwnProperty("canvas")){
            Au.canvas.width = window.innerWidth;
            Au.canvas.height = window.innerHeight;
        }
    });
};
//game logic, called on main thread
Au.mainLoop = function () {
    Au.logic();
    Au.loopId = window.setTimeout(Au.mainLoop, 15);
};
//animation frame 
Au.renderLoop = function() {
    Au.render();
    Au.animationId = window.requestAnimationFrame(Au.renderLoop);
};
//main logic processing
Au.logic = function(){
    //poll server for new events
    Au.getMessageTimer-=15;
    if(Au.getMessageTimer<=0){
        Au.getMessageTimer = Au.varMessagePollTime;
        Au.getMessage();
    }
    //read from buffer and handle events
    for(let i=0;i<Au.varMessageBuffer.length;i+=1){
        Au.processor.processEvent(Au.varMessageBuffer[i]);
    }
    Au.varMessageBuffer = [];
    Au.state.update();
    
};
//main rendering
Au.render = function(){
    for (const state of Object.values(Au.states)) {
      if(state!=Au.state){
        state.hide();
      }
    }
    Au.state.render();
};

//message should be a json string, processed by: JSON.stringify()
Au.sendMessage = function(jsonString){
    let data = {
        pid:Au.varPlayerId,
        kind:"send",
        area:Au.varArea,
        message:jsonString
    };
    console.log("sending: ",jsonString);
    $.ajax({
        url:Au.BASE_URL,
        data:data,
        method:"POST",
        dataType:"JSON"
    });
};
//fires periodically while the main loop is running
//pushes raw messges (strings) into the event queue and updates the message id
//messageId can be used for debugging, but will usually be the most recent message id recieved
Au.getMessage = function(messageId){
    if(Au.varWaitingForMessage){
        return;
    }
    Au.varWaitingForMessage = true;
    if(!messageId){
        messageId = Au.varMessageId;
    }
    let data = {
        pid:Au.varPlayerId,
        kind:"get",
        area:Au.varArea,
        id:messageId
    };
    $.ajax({
        url:Au.BASE_URL,
        data:data,
        method:"POST",
        dataType:"JSON"
    }).done(function(e){
        if(e.data.length>0){
            for(let i=0;i<e.data.length;i+=1){
                let message = e.data[i];
                Au.varMessageBuffer.push(message.message);
                if(message.id>Au.varMessageId){
                    Au.varMessageId = message.id;
                }
            }
        }
        Au.varWaitingForMessage = false;
    });
    
};

//Used to forcibly reset the DB (wipe all data)
Au.resetServer = function(area){
    let data = {
        pid:Au.varPlayerId,
        kind:"reset",
		area:area
    };
    $.ajax({
        url:Au.BASE_URL,
        data:data,
        method:"POST",
        dataType:"JSON"
    }).done(function(e){
        console.log("reset done",e);
    });
    
    
};


//---local events
Au.handleQR = function(result){
    Au.states.statePlaying.varLookingAtQr = result;
    Au.states.statePlaying.varLookingAtTime = Au.TIME_LOOK_AT;//have 3 seconds to act while the QR code is dropped
    
    //send tag scan notification to other players (passive notification)
    Au.sendMessage(JSON.stringify({
        kind:Au.EVENTS.TAG_INFO,
        name:Au.varPlayerId,
        tag:result,
    }));
    
};


Au.scanFromFile =function () {
    let img = new Image();
    let files = $("#iptImgFile")[0].files;
    if(!files.length){
            alert("no selection");
        console.log("no image selected");
        return;
    }
    img.src = window.URL.createObjectURL(files[0]);
    img.onload = function() {
      window.URL.revokeObjectURL(this.src);
      let canvW = img.naturalWidth;
      let canvH = img.naturalHeight;
       let maxImgWidth = 1024;
        if(img.naturalWidth>maxImgWidth){//scale down image to speed up detection
            let scale = maxImgWidth/img.naturalWidth;//keep aspect ratio
            canvW*=scale;
            canvH*=scale;
            canvW = Math.floor(canvW);
            canvH = Math.floor(canvH);
        }
        var canvas = document.createElement('canvas');
        canvas.width =   canvW;
        canvas.height =  canvH;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0 ,canvW,canvH);
        var imgData = context.getImageData(0, 0, canvW, canvH);
        let decodedImg = jsQR(imgData.data, canvW, canvH);
        if(decodedImg){
            Au.handleQR(decodedImg.data);
        }else{
            alert("QR not found");
        }
    };
    
    
};

//resets all minigames for completion again
Au.resetMinigames =function(){
    var doneTask = function(){
        alert("done!");
        let task = $("#btnCloseTask").attr("data-task");
        if(task){
            Au.middleware.getTask(task).isStarted = true;
        }
    };
    
    for(let i=0;i<Au.states.stateTask.minigames.length;i+=1){
      Au.states.stateTask.minigames[i].reset(doneTask);
    }
    
};

//debugging on ios using alerts
/*
handleError = function(evt){
    if (evt.message) { // Chrome sometimes provides this
      alert("error: "+evt.message +" at linenumber: "+evt.lineno+" of file: "+evt.filename);
    } else {
      alert("error: "+evt.type+" from element: "+(evt.srcElement || evt.target));
    }
    
};
window.addEventListener("error", handleError, true);
console.warn = function(e){alert(e);}
*/
window.onload = Au.init;





console.log(Au);






//----testing AR toolkit






window.onload = function() {
Au.init();

/*
	ARController.getUserMediaThreeScene({
		maxARVideoSize: 640,
		cameraParam: 'AR/Data/camera_para.dat',
		onSuccess: function(arScene, arController, arCamera) {

			document.body.className = arController.orientation;

			arController.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX);

			var renderer = new THREE.WebGLRenderer({antialias: false});
			//if (arController.orientation === 'portrait') {
			
			if (arController.orientation === 'portrait') {
				var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
				var h = window.innerWidth;
				renderer.setSize(w, h);
				renderer.domElement.style.paddingBottom = (w-h) + 'px';
			} else {
				if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
					renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);
				} else {
					renderer.setSize(arController.videoWidth, arController.videoHeight);
					document.body.className += ' desktop';
				}
			}
            renderer.domElement.style.zIndex = -100;
            renderer.domElement.style.position = "fixed";

			document.body.insertBefore(renderer.domElement, document.body.firstChild);

			var rotationV = 0;
			var rotationTarget = 0;

			renderer.domElement.addEventListener('click', function(ev) {
				ev.preventDefault();
				rotationTarget += 1;
			}, false);

            
			var cube = new THREE.Mesh(
				new THREE.BoxGeometry(1,1,1),
				new THREE.MeshNormalMaterial()
			);
			cube.material.flatShading;
			cube.position.z = 0.5;


			var markerRoot = arController.createThreeBarcodeMarker(5, 1);
			markerRoot.add(cube);
			arScene.scene.add(markerRoot);

			var markerRoot = arController.createThreeBarcodeMarker(20, 1);
			arScene.scene.add(markerRoot);

			arController.loadMarker('AR/Data/patt.hiro', function(markerId) {
				var markerRoot = arController.createThreeMarker(markerId, 3);
				markerRoot.add(cube);
				arScene.scene.add(markerRoot);
			});

			var tick = function() {
				arScene.process();
                
				cube.rotation.z += rotationV;
				rotationV *= 0.8;

				arScene.renderOn(renderer);
				requestAnimationFrame(tick);
			};

			tick();

		}
	});
*/

};



























