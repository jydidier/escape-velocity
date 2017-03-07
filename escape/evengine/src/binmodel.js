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