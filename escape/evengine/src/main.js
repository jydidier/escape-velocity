

function main() {
    var fileLoader = new FileLoader();
    var renderManager = new RenderManager();
    var level = new Level(fileLoader);
    
    fileLoader.loadJSON('data/terran.json').then(
        function() {
            return level.init(fileLoader.getData('data/terran.json'));
        }
    ).then( 
        function() {
            level.player.setCamera(renderManager.getCamera());
            
            level.buildSceneGraph();
            renderManager.setScene(level.getScene());
            renderManager.setPlayer(level.player);
            renderManager.animate();                
        }
    );
}