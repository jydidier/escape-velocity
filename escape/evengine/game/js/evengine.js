
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
    
    this.loadJSON = function(fileUrl) {
        return load('json', fileUrl);
    };
    
    this.loadData = function(fileUrl) {
        return load('arraybuffer', fileUrl);
    };

}    
//     var byteArray = new Uint8Array(arrayBuffer);



var Level = function(groundData) {
    // level needs 64x64 patches and at most 256 textures
    // 512x512 textures are good.
    var scene;
    
    this.getScene = function() {
        return scene;
    }
    
    var buildGeometry = function( heightMap ) {
        var geometry = new THREE.PlaneGeometry(255, 255,255,255);
        console.log(geometry);
        var byteArray = new Uint8Array(heightMap);
        var i;
        
        console.log(geometry.vertices.length, byteArray.length);
        for (i=0; i < byteArray.length; i++) {
            geometry.vertices[i].z = byteArray[i]/16;
        }
        geometry.verticesNeedUpdate = true;
        geometry.computeVertexNormals();
        geometry.normalsNeedUpdate = true;
        
        var bgeom = new THREE.BufferGeometry();
        bgeom.fromGeometry(geometry);
        return bgeom;        
    };
    
    var buildSceneGraph = function() {
        scene = new THREE.Scene();        
        var meshLevel = new THREE.Mesh(
            buildGeometry(groundData),
            //new THREE.MeshLambertMaterial({color : 0xffffff})
            new THREE.MeshNormalMaterial()
        );
        var light = new THREE.DirectionalLight();
        light.position.x = -1;
        light.position.y = -1;
        light.position.z = 1;
        scene.add(meshLevel);
        scene.add(light);
    };
    
    buildSceneGraph();    
}

function RenderManager() {
    var renderer = new THREE.WebGLRenderer();
    var scene;

    var resize = function() {
        renderer.setSize(window.innerWidth, window.innerHeight);        
    };
    
    this.setScene = function(s) {
        scene = s;
    };
    
    this.render = function() {
        renderer.render(scene, camera);
    };

    this.animate = function() {
        
        scene.rotation.z += 0.01;
        render();
    }

    var camera = new THREE.PerspectiveCamera( 45,
                            window.innerWidth/window.innerHeight,0.1,10000  );
    camera.position.z = 300;
    camera.position.y = -300;
    camera.lookAt(new THREE.Vector3(0,0,0));
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    window.onresize =  resize;
    document.body.appendChild(renderer.domElement);     
}



function main() {
    var fileLoader = new FileLoader();
    var renderManager = new RenderManager();
    
    fileLoader.loadData('data/TERRAN.RAW').then(
        function() {
            var level = new Level(fileLoader.getData('data/TERRAN.RAW'));
            renderManager.setScene(level.getScene());
            
            renderManager.render();
        }
    );
}