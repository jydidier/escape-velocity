
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
