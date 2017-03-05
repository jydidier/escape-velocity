// Sending and Receiving Binary Data
//   https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data

var FileLoader = function() {
    var files = {};

    
    this.getData = function (file) {
        return files[file];
    };

    // it should be nice to send back a promise 
    var load = function(type, fileUrl) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', fileUrl);
            request.responseType = type;
            
            request.onload = function() {
                if (request.status === 200) {
                    files[fileUrl] = request.response;
                    resolve(request.response);
                } else {
                    reject('Could not load file ' + fileUrl);
                }
            };
            request.onerror = function(e) {
                reject('Network error when loading ' + fileUrl);
            };
            
            request.send();
        });
    };
    
    this.loadTexture = function(fileUrl) {
        return new Promise(function (resolve, reject) {
            var loader = new THREE.TextureLoader();
            loader.load(
                fileUrl,
                function(texture) {
                    files[fileUrl] = texture;
                    resolve(texture);
                },
                function(xhr) {},
                function(xhr) {
                    reject('Texture not downloaded ' + fileUrl);
                }
            );
        });
    };

    this.loadJSON = function(fileUrl) {
        return load('json', fileUrl);
    };
    
    this.loadData = function(fileUrl) {
        return load('arraybuffer', fileUrl);
    };
    

}    
//     var byteArray = new Uint8Array(arrayBuffer);
