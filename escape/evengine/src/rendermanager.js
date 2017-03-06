
function RenderManager() {
    var renderer = new THREE.WebGLRenderer();
    var scene;
    var self = this;
    var player;
    var gamepad;

    this.getCamera = function() {
        return camera;
    };
    
    this.render = function() {
        renderer.render(scene, camera);
    };

    var resize = function() {
        renderer.setSize(window.innerWidth, window.innerHeight); 
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        self.render();
    };
    
    
    var anticipateGroundCollision = function() {
        var raycaster = new THREE.Raycaster();
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
        
        if (e.key === 'm') {
            document.getElementById('audio').muted = ! document.getElementById('audio').muted;
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
        
        requestAnimationFrame(self.animate);
    };

    var registerGamepad = function(e) {
        gamepad = e.gamepad;
    };
    
    var camera = new THREE.PerspectiveCamera( 45,
                            window.innerWidth/window.innerHeight,0.001,100  );
    camera.position.z = 30 ;
    camera.position.y = -30;
    camera.lookAt(new THREE.Vector3(0,0,0));
    
    renderer.setClearColor(0xaaaaaa);
    renderer.setSize(window.innerWidth, window.innerHeight);
    window.onresize =  resize;
    document.body.onkeypress = keyPress;
    
    window.addEventListener("gamepadconnected", registerGamepad);
    document.body.appendChild(renderer.domElement);     
}