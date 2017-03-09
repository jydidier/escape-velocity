var Player = function() {
    var camera;
    var speed = 0.1;
    var clock = new THREE.Clock(false);
    var barrel = 0;
    
    this.setCamera = function (c) {
        camera = c;        
    };
    
    this.setPosition = function(x, y, z, pitch, yaw, roll) {
        camera.position.x = x;
        camera.position.y = y;
        camera.position.z = z;
        camera.rotation.x = roll + Math.PI/2;
        camera.rotation.y = pitch;
        camera.rotation.z = yaw;
    };
    
    this.animate = function() {
        if (clock.running === false) {
            clock.start();
        } else {
            var goto = camera.getWorldDirection();
            goto.normalize();
            goto.multiplyScalar(speed*clock.getDelta());
            camera.position.add(goto);
            
            if (camera.position.x > 128) { camera.position.x = 128; speed= 0; }
            if (camera.position.x < -128) { camera.position.x = -128; speed=0; }
            if (camera.position.y > 128) { camera.position.y = 128; speed = 0; }
            if (camera.position.y < -128) { camera.position.y = -128; speed = 0;}
            
            
            // we need to stabilize barrel roll

//             camera.rotateOnAxis(new THREE.Vector3(0,0,1), -0.1*barrel);
//             barrel -= 0.1*barrel;
//             console.log(barrel);
//             
        }
    };
    
    var dir = new THREE.Vector3();
    var ref = new THREE.Vector3();
    var q = new THREE.Quaternion();
    var q0, n;
    
    this.handleGroundCollision = function(distance,object,face) {
        if (distance < speed) {
            // then we have to do something !            
            n = face.normal;
            camera.getWorldDirection(dir);
            ref=dir.clone();
            ref.reflect(n);
            ref.normalize();
            dir.normalize();
            
            
            q.setFromUnitVectors(dir,ref);
            q0 = camera.getWorldQuaternion();
            q.premultiply(q0);
            camera.setRotationFromQuaternion(q);
            this.reduceSpeed();
        }
        
    };
    
    this.increaseSpeed = function() {
        if (speed < 10) {
            speed += 0.1;
        }
    };
    
    this.reduceSpeed = function() {
        if (speed > 0) {
           speed -=0.1;
        } else {
           speed = 0;
        }
    };
    
    this.lookUp = function() {
        camera.rotateOnAxis(new THREE.Vector3(1,0,0), 0.02);
    };

    this.lookDown = function() {
        camera.rotateOnAxis(new THREE.Vector3(1,0,0), -0.02);
        
    };
    
    this.lookLeft = function() {
        camera.rotateOnAxis(new THREE.Vector3(0,1,0), 0.02);
        // let's barrel roll a bit !
         //camera.rotateOnAxis(new THREE.Vector3(1,0,0), -0.02);
    };
    
    this.lookRight = function() {
        camera.rotateOnAxis(new THREE.Vector3(0,1,0), -0.02);
        // let's barrel roll a bit !
        //camera.rotateOnAxis(new THREE.Vector3(1,0,0), -0.02);
    };


};