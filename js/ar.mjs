
import Au from "./globals.mjs";

export default class AR {
    constructor() {
        let self = this;
		self.playerTags = ["A","B","C","D","E","F","G","H"];
        ARController.getUserMediaThreeScene({
            cameraParam: 'AR/Data/camera_para.dat',
            onSuccess: function(arScene, arController, arCamera) {
				self.arScene = arScene;
				self.arController = arController;
                arController.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX);
                self.renderer = new THREE.WebGLRenderer({
                    antialias: false
                });
                //scale the view from the camera to be the same width as the screen 
                let vidW = arController.videoWidth;
                let vidH = arController.videoHeight;
                let isRotate = false;
                //on phones, the camera is landscape. This is rotated 90 degress if holding the phone portrait
                //so check if the phone is portrait, if so, counter-rotate the canvas
                //note, rotating the canvas will mean the text is also rotated, so it'll need to be rotated as well
                if(window.innerWidth<window.innerHeight){
                    self.renderer.domElement.style.transform = 'rotate(270deg)';
                    let temp = vidW;
                    vidW = vidH;
                    vidH = temp;
                    isRotate = true;
                }
				let scale = window.innerWidth/vidW;
				let w = scale*vidW;
				let h = scale*vidH;
				
				self.renderer.setSize(w, h);
                //set the rendering canvas to sit behind everything.
                self.renderer.domElement.style.zIndex = -100;
                self.renderer.domElement.style.position = "fixed";
				self.renderer.domElement.id = "canvAR";
                document.body.insertBefore(self.renderer.domElement, document.body.firstChild);
				//one marker root is set up per tag
                //no need to check which players are loaded, if they are playing, they will be in view
                //if they are not, they won't, so the root will just remain invisible
				let generateMarker = function(markerId) {
                    let markerWdith = 3;
                    var markerRoot = arController.createThreeMarker(markerId, markerWdith);
                    //get the name, for unknown players, will just be a default name
					let playerTag = self.playerTags[markerId];
					let playerName = Au.middleware.getPlayerByTag(playerTag).displayName;
                    //generate 2 sprites for different colours since we can't change the text easily at runtime
                    let spriteAlive = self.makeTextSprite(playerName,33,128,33);
                    let spriteDead = self.makeTextSprite(playerName,128,33,33);
                    spriteDead.visible = false;
                    if(isRotate){
                        //rotate the text if in portrait mode
                        spriteAlive.material.rotation = 270*0.0174533;//deg to rad
                        spriteDead.material.rotation  = 270*0.0174533;
                    }
                    markerRoot.add(spriteAlive);
                    markerRoot.spriteAlive = spriteAlive;
                    markerRoot.add(spriteDead);
                    markerRoot.spriteDead = spriteDead;
                    //add each maker to the THREE scene
                    self.arScene.scene.add(markerRoot);
                };
                let pattern = 'AR/Data/player_';
				let extension = ".patt";
				for(let i=0;i<self.playerTags.length;i+=1){
					arController.loadMarker(pattern+self.playerTags[i]+extension,generateMarker);
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
        //called every animation frame, note the context is "window" here, not the class itself
        let self = Au.AR;
		if(self){
			self.arScene.process();//does the AR calculation
            //update alive/dead for each player
            for(let i=0;i<self.playerTags.length;i+=1){
                if(self.arController.threePatternMarkers.hasOwnProperty(i)){//check the markers have been loaded
                    let markerRoot = self.arController.threePatternMarkers[i];
                    if(markerRoot.visible){//is on screen (and therefore presumably a valid player)
                        let playerTag = self.playerTags[i];
                        let player = Au.middleware.getPlayerByTag(playerTag);
                        //filter out players that aren't registered (misidentified barcode)
                        if(player.hasOwnProperty("isAlive")){
                            //turn on/off the respective sprites to change their colour
                            if(player.isAlive){
                                markerRoot.spriteAlive.visible = true;
                                markerRoot.spriteDead.visible = false;
                            }else{
                                markerRoot.spriteAlive.visible = false;
                                markerRoot.spriteDead.visible = true;
                            }
                        }
                    }
                }
            }
            //update the THREE renderer
			self.arScene.renderOn(self.renderer);
			self.animationFrameTimer = requestAnimationFrame(self.tick);
		}
	}
	destroyAR(){
        //clean up the AR library as best as possible
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

    makeTextSprite(message,r,g,b) {
        //generates a "billboard" sprite (ie texture that always faces the camera)
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
        context.fillStyle = "rgba("+r+","+g+","+b+",1.0)";
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

