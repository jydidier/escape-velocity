
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
