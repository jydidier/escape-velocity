var BinModel = function(buffer) {
    THREE.Mesh.call(this);
    
    
    var data = new Int32Array(buffer);
    var unit =  1048576;
    var nUnit = 65535;
    var tUnit = 0xff0000;
    var vUnit;
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
            //console.log(faces);
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
            
            if (nv === 4) {
                var tface2 = new THREE.Face3(
                        face.vertices[0].vidx, 
                        face.vertices[2].vidx, 
                        face.vertices[3].vidx,
                        new THREE.Vector3(nx, ny, nz),
                        new THREE.Color(0xffffff),
                        materialIndex-1
                    );
                geometry.faces.push( 
                    tface2
                );
                geometry.faceVertexUvs[0].push( [
                    new THREE.Vector2(face.vertices[0].texcoords[0],face.vertices[0].texcoords[1]),
                    new THREE.Vector2(face.vertices[2].texcoords[0],face.vertices[2].texcoords[1]),
                    new THREE.Vector2(face.vertices[3].texcoords[0],face.vertices[3].texcoords[1])
                ]);
            }
           
            
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
            //console.log("texture", texture);
            materialIndex++;
            return offset + 5;
        }
    
    };
    blockDecoders[0x0E] = blockDecoders[0x18];
    
    console.log(blockDecoders);
    if (data[0] === 0x14) {
        console.log("This is a true bin file");
    }
    vUnit = nUnit / 8;
    //console.log("scale", data[1]);
    
    for (i=vOffset; i < dOffset; i+=3) {
        geometry.vertices.push(
            new THREE.Vector3(data[i]/unit, data[i+1]/unit, data[i+2]/unit)
            //new THREE.Vector3(data[i]/vUnit, data[i+1]/vUnit, data[i+2]/vUnit)
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
    //var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
    this.geometry = geometry;
    this.material = materials;
    
    geometry.computeBoundingSphere();
//     console.log("box", this.geometry.computeBoundingBox());
//     console.log("sphere", geometry.boundingSphere);
};


BinModel.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
    constructor: BinModel,
    
    clone: function () {
        return new THREE.Mesh( this.geometry, this.material ).copy( this );
    }

});