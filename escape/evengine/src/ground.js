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