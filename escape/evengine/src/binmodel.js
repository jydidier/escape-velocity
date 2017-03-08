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
    console.log("vertices", geometry.vertices);
    

    var section = data[dOffset];
    console.log("next section", section.toString(16));
    
    while (blockDecoders.hasOwnProperty(section) && section !== 0) {            
        dOffset = blockDecoders[data[dOffset]](dOffset+1);
        
        section = data[dOffset];
        console.log("next section", section.toString(16));

    }
    console.log("faces", geometry.faces);
    geometry.computeFaceNormals();
    
    //var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
    var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
    mesh.position.fromArray(place);
    mesh.rotation.x = Math.PI/2;
    scene.add(mesh);
    console.log(mesh);
    
    
    
};