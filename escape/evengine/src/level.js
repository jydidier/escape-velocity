
var Level = function(fl) {
    // level needs 64x64 patches and at most 256 textures
    // 512x512 textures are good.
    var scene;
    var config;
    var fileLoader = fl;
    var models = [];
    this.player = new Player();
    var renderer;
    var rt = new THREE.WebGLRenderTarget(1024,1024 ,{type:  THREE.UnsignedByteType, format:THREE.RGBAFormat});
    
        
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
        var i,j,instance,configModel,scale;
        if (config.models === undefined) {
            return ;
        }
        for (i =0; i < config.models.length; i++) {           
            models[i] = new BinModel(
                fl.getData(config.models[i].file)
            );
            models[i].rotation.x = Math.PI/2;
            scale = 0.5*config.models[i].size / models[i].geometry.boundingSphere.radius;
            console.log("scale factor:", scale);
            models[i].scale.x = models[i].scale.y = models[i].scale.z = scale;
            
            
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
    
    this.setRenderer = function(r) {
        renderer = r;
    };

    
    
    var createMinimap = function() {
        if (renderer === undefined) 
            return ;
        
        var fog = scene.fog.clone();
        scene.fog = null;
        
        var rtcamera = new THREE.OrthographicCamera(-128, 128, 128, -128, -1000, 1000);
        
        rtcamera.position.x = 128;
        rtcamera.position.y = 128;
        rtcamera.position.z = 0;
        rtcamera.lookAt(new THREE.Vector3(128,128,-1));
        //renderer.render(scene, rtcamera);
        renderer.render(scene, rtcamera, rt);
        
        var size = 1024*1024*4;
        var buffer = new Uint8Array((1024*1024*4)|0);

        renderer.readRenderTargetPixels ( rt, 0, 0, 1024, 1024, buffer );
        
        
        var clampedArray = Uint8ClampedArray.from(buffer);

        
        var canvas = document.getElementById('minimap');
        var ctx = canvas.getContext('2d');
        ctx.putImageData(new ImageData(clampedArray, 1024,1024),0,0);
        ctx.fillStyle = 'green';
        ctx.fillRect(1000,1000,10,10);
        console.log(canvas.toDataURL());
        scene.fog = fog;
        
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
        THREE.DefaultLoadingManager.onLoad = createMinimap;
        
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
