

export default class AR {
  constructor() {
    let self = this;
    
	ARController.getUserMediaThreeScene({
		maxARVideoSize: 640,
		cameraParam: 'AR/Data/camera_para.dat',
		onSuccess: function(arScene, arController, arCamera) {
			document.body.className = arController.orientation;
			arController.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX);
			var renderer = new THREE.WebGLRenderer({antialias: false});
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
      let pattern = 'AR/Data/player_A.patt';//'AR/Data/patt.hiro'
      //TODO: load all players and show their names instead of "player A";
      //TODO: check it uses rear camera
			arController.loadMarker(pattern, function(markerId) {
				var markerRoot = arController.createThreeMarker(markerId, 3);
        let sprite = self.makeTextSprite("player A");
				markerRoot.add(sprite);
				arScene.scene.add(markerRoot);
        console.log("added");
			});

			var tick = function() {
				arScene.process();
				arScene.renderOn(renderer);
				requestAnimationFrame(tick);
			};

			tick();

		}
	});
    
    
  }
  
  
     makeTextSprite( message  ) {
      //https://stackoverflow.com/questions/23514274/three-js-2d-text-sprite-labels
        var fontface = "Arial";
        var fontsize =  18;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        let lineWidth = 4;
        context.font = "Bold " + fontsize + "px " + fontface;
        context.strokeStyle = "rgba(0,0,0,1.0)";
        context.lineWidth = lineWidth;
        context.strokeText( message, lineWidth, fontsize + lineWidth);
        context.fillStyle = "rgba(255,255,255,1.0)";
        context.fillText( message, lineWidth, fontsize + lineWidth);
        var texture = new THREE.Texture(canvas) ;
        texture.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        return sprite;  
    }
    
  
  
  
}


