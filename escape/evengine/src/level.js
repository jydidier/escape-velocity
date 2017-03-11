
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
    };
        
    this.buildObjects = function() {
        var i,j,instance,configModel;
        if (config.models === undefined) {
            return ;
        }
        for (i =0; i < config.models.length; i++) {           
            models[i] = new BinModel(
                fl.getData(config.models[i].file)
            );
            models[i].rotation.x = Math.PI/2;
            
            configModel = config.models[i]; 
            for(j = 0; j < configModel.places.length; j++) {
                instance = models[i].clone();
                
                instance.position.x = (configModel.places[j][0]+256)%256;
                instance.position.y = (configModel.places[j][2]+256)%256;
                instance.position.z = configModel.places[j][1];
                scene.add(instance);
            }
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
            (config.navigation[0].x+256)%256, 
            (config.navigation[0].z), 
            (config.navigation[0].y+256)%256,
            config.navigation[0].pitch,
            config.navigation[0].yaw,
            config.navigation[0].roll
        );
        
        this.buildObjects();
    };
    
    //buildSceneGraph();    
}
