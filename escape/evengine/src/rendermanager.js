
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