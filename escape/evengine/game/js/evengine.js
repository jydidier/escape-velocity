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

var BinModel = function(buffer) {
    var data = new Int32Array(buffer);
    var unit =  1048576;
    var nUnit = 65535;
    var tUnit = 0xff0000;
    var vNum = data[4];
    var vOffset = 5;
    var dOffset = vOffset + vNum * 3;
    
    var i,j;
    
    var vertices = [];
    var faces = [];
    
    var blockDecoders = {
        0x00 : function(offset) {
            
        },
        0x17 : function(offset) {
            console.log("unknown section");
            return offset + 2;
        },
        0x18 : function(offset) {
            var nv = data[offset];
            var nx = data[offset+1]/nUnit;
            var ny = data[offset+2]/nUnit;
            var nz = data[offset+3]/nUnit;
            var nmagic = data[offset+4].toString(16);;

            var face = { "nv" : nv, "normal" : [nx, ny, nz], "magic" : nmagic, "vertices" :[] };
            for (j=0; j < nv; j++) {
                face.vertices.push( { "vidx" : data[offset+5+j*3], "texcoords" : [data[offset+6+j*3]/tUnit, data[offset+7+j*3]/tUnit]});
            }
            faces.push(face);
            return offset + 5 + nv*3;
        },
        0x0D : function(offset) {
            console.log("texture section");
            return offset + 5;
        }
    
    };
    
    
    if (data[0] === 0x14) {
        console.log("This is a true bin file");
    }
    
    for (i=vOffset; i < dOffset; i+=3) {
        vertices.push([data[i]/unit, data[i+1]/unit, data[i+2]/unit]);
    }
    
    console.log("vertices", vertices);
    

    var section = data[dOffset];
    console.log("next section", section.toString(16));
    
    while (blockDecoders.hasOwnProperty(section) && section !== 0) {            
        dOffset = blockDecoders[data[dOffset]](dOffset+1);
        
        section = data[dOffset];
        console.log("next section", section.toString(16));

    }
    console.log("faces", faces);
};
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
    
    this.handleGroundCollision = function(distance,object,face) {
        if (distance < speed) {
            // then we have to do something !            
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
         camera.rotateOnAxis(new THREE.Vector3(0,0,1), 0.01);
    };
    
    this.lookRight = function() {
        camera.rotateOnAxis(new THREE.Vector3(0,1,0), -0.02);
        // let's barrel roll a bit !
        camera.rotateOnAxis(new THREE.Vector3(0,0,1), -0.01);
    };


};

var Level = function(fl) {
    // level needs 64x64 patches and at most 256 textures
    // 512x512 textures are good.
    var scene;
    var config;
    var fileLoader = fl;
    var models = [];
    this.player = new Player();
        
    this.init = function(c) {
        config = c;
        var i;
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
        
        if (c.models !== undefined) {
            for(i = 0; i < c.models.length; i++) {
                p.push(fl.loadData(c.models[i]));
            }
        }
        
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
    
    this.buildObjects = function() {
        var i;
        if (config.models === undefined) {
            return ;
        }
        for (i =0; i < config.models.length; i++) {
            models[i] = new BinModel(fl.getData(config.models[i]));
        }
        
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
        
        this.buildObjects();
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