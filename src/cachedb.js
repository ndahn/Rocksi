function saveToIndexedDB(storeName, key, value){
    return new Promise(
        function(resolve, reject) {
            var dbRequest = indexedDB.open(storeName);

            dbRequest.onerror = function(event) {
                reject(Error("IndexedDB database error"));
            };

            dbRequest.onupgradeneeded = function(event) {
                var database    = event.target.result;
                var objectStore = database.createObjectStore(storeName, {keyPath: "key"});
            };

            dbRequest.onsuccess = function(event) {
                var database      = event.target.result;
                var transaction   = database.transaction([storeName], 'readwrite');
                var objectStore   = transaction.objectStore(storeName);
                var objectRequest = objectStore.add( {key: key, value: value} );

                objectRequest.onerror = function(event) {
                    reject(Error('Error text'));
                };

                objectRequest.onsuccess = function(event) {
                    resolve('Data saved OK');
                };
            };
        }
    );
}

function loadFromIndexedDB(storeName, key){
    return new Promise(
        function(resolve, reject) {
            var dbRequest = indexedDB.open(storeName);

            dbRequest.onerror = function(event) {
                reject(Error('Could not open index database'));
            };

            dbRequest.onupgradeneeded = function(event) {
                // Objectstore does not exist. Nothing to load
                event.target.transaction.abort();
                reject(Error('Not found'));
            };

            dbRequest.onsuccess = function(event) {
                var database      = event.target.result;
                var transaction   = database.transaction([storeName]);
                var objectStore   = transaction.objectStore(storeName);
                var objectRequest = objectStore.get(key);

                objectRequest.onerror = function(event) {
                    reject(Error('Error text'));
                };

                objectRequest.onsuccess = function(event) {
                    if (objectRequest.result) {
                        resolve(objectRequest.result.value);
                    } else {
                        reject(Error('Object not found'));
                    }
                };
            };
        }
    );
}

function loadCached(storeName, urlKey) {
    return new Promise(
        function(resolve, reject) {
            loadFromIndexedDB(storeName, urlKey)
                .then(value => {

                    console.log('Using cached instance of ' + urlKey);
                    resolve(value);

                })
                .catch(error => {
                    
                    console.log('Caching ' + urlKey);
                    fetch(urlKey)
                        .then(response => response.blob())
                        .then(valueblob => {

                            console.log(urlKey + ' transferred');
                            resolve(valueblob);
                            saveToIndexedDB(storeName, urlKey, valueblob);

                        })
                        .catch(error => {
                            reject(Error('Failed to fetch ' + urlKey))
                        });

                });
        }
    )
}

export { saveToIndexedDB, loadFromIndexedDB, loadCached }