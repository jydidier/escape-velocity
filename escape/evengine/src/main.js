

function main() {
    var fileLoader = new FileLoader();
    var renderManager = new RenderManager();
    
    fileLoader.loadData('data/TERRAN.RAW').then(
        function() {
            var level = new Level(fileLoader.getData('data/TERRAN.RAW'));
            renderManager.setScene(level.getScene());
            
            renderManager.render();
        }
    );
}