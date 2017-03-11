var Player = function() {
    var camera;
    var speed = 0.1;
    var clock = new THREE.Clock(false);
    var barrel = 0;
    var zz = new THREE.Vector3(0,0,1);
    
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
            
            if (camera.position.x > 256) { camera.position.x = 256; speed= 0; }
            if (camera.position.x < 0) { camera.position.x = 0; speed=0; }
            if (camera.position.y > 256) { camera.position.y = 256; speed = 0; }
            if (camera.position.y < 0) { camera.position.y = 0; speed = 0;}
            
            
            // we need to stabilize barrel roll

            // we compute the direction to which we must stabilize
            camera.updateMatrixWorld(true);
            var x = new THREE.Vector3();
            var y = new THREE.Vector3();
            var z = new THREE.Vector3();
            camera.matrix.extractBasis(x,y,z);
            var plane = new THREE.Plane(camera.getWorldDirection());
            var x = plane.projectPoint(zz);            
            x.normalize();                    
            var dir = zz.dot(camera.getWorldDirection());
            
            // to avoid gimbal lock
            if (dir > 0.9 || dir < -0.9) {
                return;
            } 
            
            // to detect if we are upside down
            if (zz.dot(y) < 0) {
                y.negate();
            }

            // we compute how much we must rotate to go back to stabilization
            var q = new THREE.Quaternion();
            q.setFromUnitVectors(y, x);
            var q0 = camera.quaternion;
            q.multiply(q0);
            q0.slerp(q,0.1);
            //camera.setRotationFromQuaternion(q0);
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
        camera.rotateOnAxis(new THREE.Vector3(1,0,0), 0.05);
    };

    this.lookDown = function() {
        camera.rotateOnAxis(new THREE.Vector3(1,0,0), -0.05);
    };
    
    this.lookLeft = function() {
        camera.rotateOnAxis(new THREE.Vector3(0,1,0), 0.05);
        // let's barrel roll a bit !
        camera.rotateOnAxis(new THREE.Vector3(0,0,1), 0.05);
        //camera.rotateOnAxis(new THREE.Vector3(1,0,0), -0.05);
    };
    
    this.lookRight = function() {
        camera.rotateOnAxis(new THREE.Vector3(0,1,0), -0.05);
        // let's barrel roll a bit !
        camera.rotateOnAxis(new THREE.Vector3(0,0,1), -0.05);
        //camera.rotateOnAxis(new THREE.Vector3(1,0,0), -0.05);
    };


};