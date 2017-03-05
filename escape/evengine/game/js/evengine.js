// Sending and Receiving Binary Data
//   https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data

var FileLoader = function() {
    var files = {};

    
    this.getData = function (file) {
        return files[file];
    };

    // it should be nice to send back a promise 
    var load = function(type, fileUrl) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', fileUrl);
            request.responseType = type;
            
            request.onload = function() {
                if (request.status === 200) {
                    files[fileUrl] = request.response;
                    resolve(request.response);
                } else {
                    reject('Could not load file ' + fileUrl);
                }
            };
            request.onerror = function(e) {
                reject('Network error when loading ' + fileUrl);
            };
            
            request.send();
        });
    };
    
    this.loadTexture = function(fileUrl) {
        return new Promise(function (resolve, reject) {
            var loader = new THREE.TextureLoader();
            loader.load(
                fileUrl,
                function(texture) {
                    files[fileUrl] = texture;
                    resolve(texture);
                },
                function(xhr) {},
                function(xhr) {
                    reject('Texture not downloaded ' + fileUrl);
                }
            );
        });
    };

    this.loadJSON = function(fileUrl) {
        return load('json', fileUrl);
    };
    
    this.loadData = function(fileUrl) {
        return load('arraybuffer', fileUrl);
    };
    

}    
//     var byteArray = new Uint8Array(arrayBuffer);

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

var Level = function(fl) {
    // level needs 64x64 patches and at most 256 textures
    // 512x512 textures are good.
    var scene;
    var config;
    var fileLoader = fl;
    this.player = new Player();
        
    this.init = function(c) {
        config = c;
        var elem = document.getElementById('audio');
        var source = document.createElement('source');
        source.setAttribute('src',config.musicFile);
        source.setAttribute('type','audio/flac');
        elem.appendChild(source);
        
        
        var p = [
            fl.loadData(config.heightMap),
            fl.loadData(config.textureMap),
            fl.loadTexture(config.texture)
        ];
        /*return fl.loadData(config.heightMap).then(
                function() { return fl.loadData(config.textureMap); }
            ).then(
                function() { return fl.loadTexture(config.texture); }
            );*/
        
        return Promise.all(p);
    };
    
    
    this.getScene = function() {
        return scene;
    }
    
    var buildGeometry = function( ) {
        var tileSize = 256;
        var geometry = new THREE.PlaneGeometry(tileSize, tileSize,tileSize,tileSize);
        var heights = new Uint8Array(fl.getData(config.heightMap));
        var textures = new Uint8Array(fl.getData(config.textureMap));
        var i,j,idx;
        
        
        var p,q, vc;
        for (i=0; i < heights.length; i++) {
            // if, as I suspect 
            // height is given at the center of the square
            // geometry.vertices[i].z = heights[i]/16;
            p = i % 256;
            q = (i / 256)|0;
            
            vc = geometry.vertices[i];
            idx = (vc.x + 128) + 256 * // résultat pouvant donner 256
                (128 - vc.y);
                
            
            
            geometry.vertices[i].z += heights[idx]/256;
            geometry.vertices[i+1].z += heights[idx]/256;
            geometry.vertices[i+tileSize-1].z += heights[idx]/256;
            geometry.vertices[i+tileSize].z += heights[idx]/256;
        }
        
        var vertices = geometry.vertices;
        var faces = geometry.faces;
        
        

        var vc, r, s, tidx, shift,tc, tb, ta;
        for (i=0; i < faces.length; i++) {
            /*v1 = vertices[faces[i].a] ;
            v2 = vertices[faces[i].b] ;*/
            vc = vertices[faces[i].c] ;
            // this should be computed according to vertex position
            // a,b,c = 0,257,1  a,b,c = 257,258,1
            // use c as an anchor
            
            ta = faces[i].a ;
            tb = faces[i].b ;
            tc = faces[i].c ;
            
            //
            tidx = textures[
                (vc.x + 127) + 256 * // résultat pouvant donner 256
                (128 - vc.y) // résultat pouvant donner 256
                
                
                // tc - 1
            ];
            
            r = (tidx % 16) *64 / 1024 + 0.5 / 1024 ; // offsets
            s = ((tidx / 16)|0) *64 / 1024 + 63.5 / 1024 ; // offsets
            shift = 63/1024;
            
            geometry.faceVertexUvs[0][i] = [
                new THREE.Vector2(r , s - (((tc-ta) > 0)?0:shift) ),
                new THREE.Vector2(r + (((tb - ta) === 1)?shift:0) , s - shift ),
                new THREE.Vector2(r + shift, s)
            ];
            
        }
        
        geometry.verticesNeedUpdate = true;
        geometry.computeVertexNormals();
        geometry.normalsNeedUpdate = true;
        geometry.uvsNeedUpdate=true;
        
        console.log(geometry);
        console.log(textures);
        
        var bgeom = new THREE.BufferGeometry();
        bgeom.fromGeometry(geometry);
        return bgeom;        
    };
    
    this.buildSceneGraph = function() {
        var texture = fl.getData(config.texture);
        scene = new THREE.Scene();

        scene.fog = /*new THREE.FogExp2(0xaaaaaa);*/new THREE.Fog(0xaaaaaa, 0.0625, 20);        
        var meshLevel = new THREE.Mesh(
            buildGeometry(),
            new THREE.MeshLambertMaterial({color : 0xffffff, map: texture})
            //new THREE.MeshNormalMaterial()
        );
        meshLevel.name = "ground";
        var light = new THREE.DirectionalLight();
        light.position.x = -1;
        light.position.y = -1;
        light.position.z = 1;
        scene.add(meshLevel);
        scene.add(light);
        
        this.player.setPosition(
            config.navigation[0].x, 
            config.navigation[0].y, 
            config.navigation[0].z,
            config.navigation[0].pitch,
            config.navigation[0].yaw,
            config.navigation[0].roll
        );
    };
    
    //buildSceneGraph();    
}


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
        
    }
    
    var keyPress = function(e) {
        //console.log(e);
        
        if (e.keyCode === 38) {
            player.lookUp();
        }
        
        if (e.keyCode === 40) {
            player.lookDown();
        }
        
        if (e.keyCode === 37) {
            player.lookLeft();
        }
        
        if (e.keyCode === 39) {
            player.lookRight();
        }
        
        if (e.key === 'm') {
            document.getElementById('audio').muted = ! document.getElementById('audio').muted;
        }
        
        if (e.key === '+') {
            player.increaseSpeed();
        };
        
        if (e.key === '-') {
            player.reduceSpeed();
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
    }
    
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
    }

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


function main() {
    var fileLoader = new FileLoader();
    var renderManager = new RenderManager();
    var level = new Level(fileLoader);
    
    fileLoader.loadJSON('data/terran.json').then(
        function() {
            return level.init(fileLoader.getData('data/terran.json'));
        }
    ).then( 
        function() {
            level.player.setCamera(renderManager.getCamera());
            
            level.buildSceneGraph();
            renderManager.setScene(level.getScene());
            renderManager.setPlayer(level.player);
            renderManager.animate();                
        }
    );
}