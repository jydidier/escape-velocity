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

var BinModel = function(scene, place, buffer) {
    var data = new Int32Array(buffer);
    var unit =  1048576;
    var nUnit = 65535;
    var tUnit = 0xff0000;
    var vNum = data[4];
    var vOffset = 5;
    var dOffset = vOffset + vNum * 3;
    var materials = [];
    var materialIndex = 0;
    var loader = new THREE.TextureLoader();
    loader.setPath('data/');
    
    var i,j;
    
    var faces = [];
    
    var geometry = new THREE.Geometry();
    
    
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
                face.vertices.push( { "vidx" : data[offset+5+j*3], "texcoords" : [data[offset+6+j*3]/tUnit,1- data[offset+7+j*3]/tUnit]});
            }
            faces.push(face);
            
            var tface = new THREE.Face3(
                    face.vertices[0].vidx, 
                    face.vertices[1].vidx, 
                    face.vertices[2].vidx,
                    new THREE.Vector3(nx, ny, nz),
                    new THREE.Color(0xffffff),
                    materialIndex-1
                );
            //tface.materialIndex = materialIndex -1 ;

            geometry.faces.push( 
                tface
            );
            geometry.faceVertexUvs[0].push( [
                new THREE.Vector2(face.vertices[0].texcoords[0],face.vertices[0].texcoords[1]),
                new THREE.Vector2(face.vertices[1].texcoords[0],face.vertices[1].texcoords[1]),
                new THREE.Vector2(face.vertices[2].texcoords[0],face.vertices[2].texcoords[1])
//                 face.vertices[1].texcoords,
//                 face.vertices[2].texcoords
            ]);
           
            
            return offset + 5 + nv*3;
        },
        0x0D : function(offset) {
            console.log("texture section");
            var tmpstr = new Uint8Array(buffer, offset * 4 + 4, 16);
            var str = [];
            var i = 0;
            while (tmpstr[i] !== 0) {
                str[i] = tmpstr[i];
                i++;
            }
            var textureName = String.fromCharCode.apply(null, str);
            var texture = loader.load(textureName+'.png');
            materials.push(new THREE.MeshLambertMaterial({color: 0xffffff, map : texture}));
            console.log("texture", texture);
            materialIndex++;
            return offset + 5;
        }
    
    };
    
    
    if (data[0] === 0x14) {
        console.log("This is a true bin file");
    }
    
    for (i=vOffset; i < dOffset; i+=3) {
        geometry.vertices.push(
            new THREE.Vector3(data[i]/nUnit, data[i+1]/nUnit, data[i+2]/nUnit)
        );
    }
    

    var section = data[dOffset];
    console.log("next section", section.toString(16));
    
    while (blockDecoders.hasOwnProperty(section) && section !== 0) {            
        dOffset = blockDecoders[data[dOffset]](dOffset+1);
        
        section = data[dOffset];
        console.log("next section", section.toString(16));

    }
    //geometry.computeFaceNormals();
    
    //var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
    var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
    mesh.position.fromArray(place);
    mesh.rotation.x = Math.PI/2;
    scene.add(mesh);
    console.log(mesh);
    
};
var Ground = function(heightArray, textureArray, textures, texturePath) {
    // this is another attempt aiming at segmenting the problem of ground texture generation
    var tileSize = 256;
    var heightMap = new Uint8Array(heightArray);
    var textureMap = new Uint8Array(textureArray);
    var tLoader = new THREE.TextureLoader();
    tLoader.setPath(texturePath);
    var groundGroup = new THREE.Group();
    
    
    var i,j,k,idx;
    
    // then we make the patches (1 for each material)
    // very naive method to see what kind of performance we can achieve
    // in a few passes, quads and textures at the same time.
    // up to 16x more spaces for vertices
    
    // we will try to share vertices between geometries !
    var vertices = [];
    var normals = [];
    var h,tid;
    var v1, v2, f1, f2;

    // this is the foundation of our vertices !
    for (i=0; i <  257; i++) {
        for (j=0; j < 257; j++) {
            h = heightMap[i%256 + 256*(j%256)];                
            vertices.push(new THREE.Vector3(i,j,h/64));
            
            v1 = new THREE.Vector3(2,0, 
                (heightMap[(i+1)%256 + 256*(j%256)] -
                heightMap[(i+255)%256 + 256*(j%256)])/64
            );
            
            v2 = new THREE.Vector3(0,2, 
                (heightMap[i%256 + 256*((j+1)%256)] -
                heightMap[i%256 + 256*((j+255)%256)])/64
            );
            
            v1.cross(v2);
            v1.normalize();
            
            normals.push(v1);
        }            
    }
    
    // now let's build our faces 
    var fid;
    for ( k=0; k < textures.length; k++) {
        var geometry = new THREE.Geometry();
        var material = new THREE.MeshLambertMaterial(
            {color: 0xffffff, map: tLoader.load(textures[k]+'.png') }
            //{color: 0xffffff }
        );
        
        geometry.vertices = vertices;
        for (i = 0; i < 256; i++) {
            for (j=0; j < 256; j++) {
                tid = textureMap[j%256 + 256*(i%256)];
                
                if (tid === k) {
                    fid = geometry.faces.length;
                    
                    f1 = new THREE.Face3(
                        i + 257*j,
                        i + 257*(j+1),
                        (i+1) + 257*j
                    );
                    
                    f1.vertexNormals = [
                        normals[i + 257*j],
                        normals[i + 257*(j+1)],
                        normals[(i+1) + 257*j]
                    ];
                    
                    f2 = new THREE.Face3(
                        i + 257*(j+1),
                        (i+1) + 257*(j+1),
                        (i+1) + 257*j
                    );
                    
                    f2.vertexNormals = [
                        normals[i + 257*(j+1)],
                        normals[(i+1) + 257*(j+1)],
                        normals[(i+1) + 257*j]                    
                    ];
                    
                    
                    geometry.faces.push(f1);
                    geometry.faces.push(f2);
                    
                    geometry.faceVertexUvs[0][fid] = [
                        new THREE.Vector2(0,1),
                        new THREE.Vector2(0,0),
                        new THREE.Vector2(1,1)
                    ];
                    geometry.faceVertexUvs[0][fid+1] = [
                        new THREE.Vector2(0,0),
                        new THREE.Vector2(1,0),
                        new THREE.Vector2(1,1)
                    ];
                    
                }
            }
        }
        
        geometry.verticesNeedUpdate = true;
        //geometry.computeVertexNormals();
        geometry.normalsNeedUpdate = true;
        geometry.uvsNeedUpdate=true;
        
        // then let's convert it to a buffer geometry
        var bgeom = new THREE.BufferGeometry();
        bgeom.fromGeometry(geometry);
        
        groundGroup.add(new THREE.Mesh(bgeom, material));
        
    }
    
//     groundGroup.position.x = -128;
//     groundGroup.position.y = -128;
  
  
    this.getObject = function() {
        return groundGroup;
    };
        

};
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
            
            if (camera.position.x > 128) { camera.position.x = 128; speed= 0; }
            if (camera.position.x < -128) { camera.position.x = -128; speed=0; }
            if (camera.position.y > 128) { camera.position.y = 128; speed = 0; }
            if (camera.position.y < -128) { camera.position.y = -128; speed = 0;}
            
            
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
                console.log(c.models[i]);
                p.push(fl.loadData(c.models[i].file));
            }
        }
                
        return Promise.all(p);
    };
    
    
    this.getScene = function() {
        return scene;
    }
    
    var buildMesh = function() {
        var tileSize = 256;
        var geometries = []; //new THREE.Geometry();
        var heights = new Uint8Array(fl.getData(config.heightMap));
        var textures = new Uint8Array(fl.getData(config.textureMap));
        var tLoader = new THREE.TextureLoader();
        tLoader.setPath(config.texturePath);
        var materials = [];
        
        var i,j,k,idx;
        // first, we load textures
        for (i=0; i < config.textures.length; i++) {
            materials.push(
                new THREE.MeshLambertMaterial(
                    {color: 0xffffff, map: tLoader.load(config.textures[i]+'.png') }
                )
            );
        }
        
        // then we make the patches (1 for each material)
        // very naive method to see what kind of performance we can achieve
        // in a few passes, quads and textures at the same time.
        // up to 16x more spaces for vertices
        for (k = 0; k < materials.length(); k++) {
            let geom = new THREE.Geometry();
            for (i =0; i <  256; i++) {
                for (j=0; j < 256; j++) {
                    
                    
                    
                }            
            }
        }
  
        
        return mesh;        
    };
    
    
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
                
            
            
            geometry.vertices[i].z += heights[idx]/64;
            geometry.vertices[i+1].z += heights[idx]/64;
            geometry.vertices[i+tileSize-1].z += heights[idx]/64;
            geometry.vertices[i+tileSize].z += heights[idx]/64;
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
            models[i] = new BinModel(
                scene, 
                config.models[0].places[0], 
                fl.getData(config.models[i].file)
            );
        }
                       
    };
    
    
    this.buildSceneGraph = function() {
        //var texture = fl.getData(config.texture);
        scene = new THREE.Scene();

        scene.fog = /*new THREE.FogExp2(0xaaaaaa);*/new THREE.Fog(0xaaaaaa, 0.0625, 20);        
//         var meshLevel = new THREE.Mesh(
//             buildGeometry(),
//             new THREE.MeshLambertMaterial({color : 0xffffff, map: texture})
//             //new THREE.MeshNormalMaterial()
//         );
        //var meshLevel = buildMesh();
        var ground = new Ground(
            fl.getData(config.heightMap),
            fl.getData(config.textureMap),
            config.textures,
            config.texturePath            
        );
        
        
        var meshLevel = ground.getObject();
        
        
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
    var paused = false;

    var raycaster = new THREE.Raycaster();

    
    var pause = function() {};
    
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
            var elem = document.querySelector('canvas');
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
    
    var camera = new THREE.PerspectiveCamera( 45,
                            window.innerWidth/window.innerHeight,0.001,20  );
    camera.position.z = 300 ;
    camera.position.y = -100;
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