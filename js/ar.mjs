
import Au from "./globals.mjs";

export default class AR {
    constructor() {
        let self = this;
        ARController.getUserMediaThreeScene({
            cameraParam: 'AR/Data/camera_para.dat',
            onSuccess: function(arScene, arController, arCamera) {
				self.arScene = arScene;
				self.arController = arController;
                document.body.className = arController.orientation;
                arController.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX);
                self.renderer = new THREE.WebGLRenderer({
                    antialias: false
                });
                console.log(arController.videoWidth,arController.videoHeight);
                let vidW = arController.videoWidth;
                let vidH = arController.videoHeight;
                if(window.innerWidth<window.innerHeight){
                    self.renderer.domElement.style.transform = 'rotate(270deg)';
                    let temp = vidW;
                    vidW = vidH;
                    vidH = temp;
                }
				let scale = window.innerWidth/vidW;
				let w = scale*vidW;
				let h = scale*vidH;
				
				self.renderer.setSize(w, h);
                self.renderer.domElement.style.zIndex = -100;
                self.renderer.domElement.style.position = "fixed";
				self.renderer.domElement.id = "canvAR";
                document.body.insertBefore(self.renderer.domElement, document.body.firstChild);
				
				let playerTags = ["A","B","C","D","E","F","G","H"];
				let patternDetection = function(markerId) {
                    var markerRoot = arController.createThreeMarker(markerId, 3);
					let playerTag = playerTags[markerId];
					let playerName = Au.middleware.getPlayerByTag(playerTag).displayName;
                    let sprite = self.makeTextSprite(playerName);
                    markerRoot.add(sprite);
                    self.arScene.scene.add(markerRoot);
                    console.log("added");
                };
                let pattern = 'AR/Data/player_'; //'AR/Data/patt.hiro'
				let extension = ".patt";
				for(let i=0;i<playerTags.length;i+=1){
					arController.loadMarker(pattern+playerTags[i]+extension,patternDetection);
				}
				self.animationFrameTimer = requestAnimationFrame(self.tick);
                self.tick();
				if(Au.hasOwnProperty("canvas")){
					Au.canvas.style.opacity=0.5;
				}
            }
        });
    }
	tick(){
        let self = Au.AR;
		if(self){
			self.arScene.process();
			self.arScene.renderOn(self.renderer);
			self.animationFrameTimer = requestAnimationFrame(self.tick);
		}
	}
	destroyAR(){
		let self = this;
		$("#canvAR").remove();
		cancelAnimationFrame(self.animationFrameTimer);
		self.renderer = null;
		self.arScene = null;
		self.arController = null;
		if(Au.hasOwnProperty("canvas")){
			Au.canvas.style.opacity=1;
		}
	}

    makeTextSprite(message) {
        //https://stackoverflow.com/questions/23514274/three-js-2d-text-sprite-labels
        var fontface = "Arial";
        var fontsize = 18;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        let lineWidth = 4;
        context.font = "Bold " + fontsize + "px " + fontface;
        context.strokeStyle = "rgba(0,0,0,1.0)";
        context.lineWidth = lineWidth;
        context.strokeText(message, lineWidth, fontsize + lineWidth);
        context.fillStyle = "rgba(255,255,255,1.0)";
        context.fillText(message, lineWidth, fontsize + lineWidth);
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        return sprite;
    }


}

