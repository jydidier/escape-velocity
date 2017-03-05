var Player = function() {
    var camera;
    var speed = 0.01;
    
    this.setCamera = function (c) {
        camera = c;        
    };
    
    this.setPosition = function(x, y, z, pitch, yaw, roll) {
        camera.position.x = x;
        camera.position.y = y;
        camera.position.z = z;
        camera.rotation.x = roll + Math.PI/2;
        camera.rotation.y = pitch ;
        camera.rotation.z = yaw;
    };
    
    this.animate = function() {
        var goto = camera.getWorldDirection();
        goto.normalize();
        goto.multiplyScalar(speed);
        camera.position.add(goto);
    };
    
    this.handleGroundCollision = function(distance,object,face) {
        if (distance < speed) {
            // then we have to do something !
            console.log("bounce!");
            console.log(face);
            
            var n = face.normal;
            var dir = new THREE.Vector3();
            var ref = new THREE.Vector3();
            camera.getWorldDirection(dir);
            ref=dir.clone();
            ref.reflect(n);
            ref.normalize();
            dir.normalize();
            
            
            var q = new THREE.Quaternion();
            q.setFromUnitVectors(dir,ref);
            var q0 = camera.getWorldQuaternion();
            q.premultiply(q0);
            camera.setRotationFromQuaternion(q);
            this.reduceSpeed();

            
            //var n = new THREE.Triangle(
            
            
        }
        
    };
    
    this.increaseSpeed = function() {
        if (speed < 1) {
            speed += 0.01;
        }
    };
    
    this.reduceSpeed = function() {
        if (speed > 0) {
           speed -=0.01;
        }        
    };
    
    this.lookUp = function() {
        /*var mat = camera.matrixWorld;
        var i = new THREE.Vector3();
        var j = new THREE.Vector3();
        var k = new THREE.Vector3();
        mat.extractBasis(i, j, k);
        
        camera.rotateOnAxis(i,0.01);*/
        camera.rotation.x += 0.01;
    };

    this.lookDown = function() {
        /*var mat = camera.matrixWorld;
        var i = new THREE.Vector3();
        var j = new THREE.Vector3();
        var k = new THREE.Vector3();
        mat.extractBasis(i, j, k);
        
        camera.rotateOnAxis(i,-0.01);*/
        camera.rotation.x -= 0.01;
    };
    
    this.lookLeft = function() {
        var up = camera.up ;
        camera.rotateOnAxis(up, +0.01);
    };
    
    this.lookRight = function() {
        var up = camera.up ;
        camera.rotateOnAxis(up, -0.01);
    };


};