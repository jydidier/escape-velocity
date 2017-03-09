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
    var h,tid;

    // this is the foundation of our vertices !
    for (i=0; i <  257; i++) {
        for (j=0; j < 257; j++) {
            h = heightMap[i%256 + 256*(j%256)];                
            vertices.push(new THREE.Vector3(i,j,h/64));
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
                    
                    geometry.faces.push( new THREE.Face3(
                        i + 257*j,
                        i + 257*(j+1),
                        (i+1) + 257*j
                    ) );
                    geometry.faces.push( new THREE.Face3(
                        i + 257*(j+1),
                        (i+1) + 257*(j+1),
                        (i+1) + 257*j
                    ) );
                    
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
        geometry.computeVertexNormals();
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