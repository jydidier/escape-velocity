
function RenderManager() {
    var renderer = new THREE.WebGLRenderer();
    var scene;
    var self = this;
    var player;
    var gamepad;
    var paused = false;

    var raycaster = new THREE.Raycaster();

    
    var pause = function() {};
    
    this.getCamera = function() {
        return camera;
    };
    
    this.render = function() {
        renderer.clear();    

        document.getElementById("posx").innerHTML = camera.position.x|0;
        document.getElementById("posy").innerHTML = camera.position.y|0;
        
        // in case we are near a border, we make a two pass rendering
        if (camera.position.x < 20 || camera.position.x > 236 ||
            camera.position.y < 20 || camera.position.y > 236) {
            // then we trigger ghost rendering of the scene.
            // in fact, it can add up three more rendering passes
            
            ghostCamera.copy(camera);
            
            if (camera.position.x < 20) {
                ghostCamera.position.x += 256;                
                renderer.render(scene, ghostCamera);                
            }
            
            if (camera.position.x > 236) {
                ghostCamera.position.x -= 256;                
                renderer.render(scene, ghostCamera);                
            }
            
            if (camera.position.y < 20) {
                ghostCamera.position.y += 256;                
                renderer.render(scene, ghostCamera);                
            }
            
            if (camera.position.y > 236) {
                ghostCamera.position.y -= 256;                
                renderer.render(scene, ghostCamera);                
            }
            
            if (camera.position.x < 20 && camera.position.y < 20) {
                ghostCamera.position.x += 256;
                ghostCamera.position.y += 256;                
                renderer.render(scene, ghostCamera);                
            }
            
            if (camera.position.x > 236 && camera.position.y > 236) {
                ghostCamera.position.x -= 256;
                ghostCamera.position.y -= 256;                
                renderer.render(scene, ghostCamera);                
            }

            if (camera.position.x < 20 && camera.position.y > 236) {
                ghostCamera.position.x += 256;
                ghostCamera.position.y -= 256;                
                renderer.render(scene, ghostCamera);                
            }

            if (camera.position.x > 236 && camera.position.y < 20) {
                ghostCamera.position.x -= 256;
                ghostCamera.position.y += 256;                
                renderer.render(scene, ghostCamera);                
            }
        
        }
        renderer.render(scene, camera);
        
    };

    var resize = function() {
        renderer.setSize(window.innerWidth, window.innerHeight); 
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        self.render();
    };
    
    
    var anticipateGroundCollision = function() {
        raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
        var intersections = raycaster.intersectObject(scene, true);
        
        // we only need intersection[0]
        var inter = intersections[0];
        
        if (inter !== undefined && inter.object.name === "ground") {
            player.handleGroundCollision(inter.distance,inter.object,inter.face);            
        }
        
    };
    
    var keyPress = function(e) {
        //console.log(e);
        
        if (e.keyCode === 38) {
            player.lookUp();
            return ;
        }
        
        if (e.keyCode === 40) {
            player.lookDown();
            return ;
        }
        
        if (e.keyCode === 37) {
            player.lookLeft();
            return ;
        }
        
        if (e.keyCode === 39) {
            player.lookRight();
            return ;
        }
        
        if (e.key === 'p') {
            paused = !paused;
            if (!paused) {
                requestAnimationFrame(self.animate);
            }
        }
        
        
        if (e.key === 'm') {
            document.getElementById('audio').muted = ! document.getElementById('audio').muted;
            return ;
        }
        
        if (e.key === 'f') {
            var elem = document.body;
            var fs = elem.requestFullScreen || elem.mozRequestFullScreen || elem.webkitRequestFullScreen ;
            
            if (fs) fs.call(elem);
            
            return ;
        }
        
        if (e.key === '+') {
            player.increaseSpeed();
            return ;
        };
        
        if (e.key === '-') {
            player.reduceSpeed();
            return ;
        };
            
    };
    
    var processGamepad =  function() {
        if (gamepad.axes[0] > 0) {
            player.lookRight();
        }
        if (gamepad.axes[0] < 0) {
            player.lookLeft();
        }
        if (gamepad.axes[1] > 0) {
            player.lookDown();
        }
        if (gamepad.axes[1] < 0) {
            player.lookUp();
        }
        
        if(gamepad.buttons[0].pressed) {
            player.increaseSpeed();
        }
        
        if (gamepad.buttons[1].pressed) {
            player.reduceSpeed();
        }
    };
    
    this.setScene = function(s) {
        scene = s;
    };
    
    
    this.setPlayer = function(p) {
        player = p;
    };

    this.animate = function() {
        //scene.rotation.z -= 0.001;
        self.render();
        anticipateGroundCollision();
        if (player !== undefined) 
            player.animate();
        
        if (gamepad !== undefined) {
            processGamepad();
        }
        
        if (!paused) {
            requestAnimationFrame(self.animate);
        }
    };

    var registerGamepad = function(e) {
        gamepad = e.gamepad;
    };
    
    this.getRenderer = function() {
        return renderer;
    };
    
//     var camera = new THREE.OrthographicCamera(-128, 128, 128, -128, -1000, 1000);
//     
//     camera.position.x = 128;
//     camera.position.y = 128;
//     camera.position.z = 0;
//     camera.lookAt(new THREE.Vector3(128,128,-1));
    
    
    var camera = new THREE.PerspectiveCamera( 45,
                            window.innerWidth/window.innerHeight,0.001,20  );
    camera.position.z = 300 ;
    camera.position.y = -100;
    camera.lookAt(new THREE.Vector3(0,0,0));
    var ghostCamera = camera.clone();  
    
    renderer.setClearColor(0xaaaaaa);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    window.onresize =  resize;
    document.body.onkeypress = keyPress;
    
    window.addEventListener("gamepadconnected", registerGamepad);
    document.body.appendChild(renderer.domElement);     
}