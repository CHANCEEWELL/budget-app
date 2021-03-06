/****** Local Variables ******/
const tempDBConnection = indexedDB.open("budget", 1); // Connection to Temp DB
let tempDB;  // TempDB to hold transaction until re-connected to server

/****** Event Listeners ******/ 
window.addEventListener("online", syncTempDB); // will call "syncTempDB" when back online.

// New version of tempDB needed
tempDBConnection.onupgradeneeded = function(event) {
    tempDB = event.target.result;
    tempDB.createObjectStore("pending", {autoIncrement: true});
};

// tempDB initialized successfully
tempDBConnection.onsuccess = function(event) {
    tempDB = event.target.result;
    
    // make sure ready before reading from indexedDB
    if(navigator.onLine){
        syncTempDB();
    }
};

// tempDB initialized error
tempDBConnection.onerror = function(event){
    console.log(`Error trying to initialize local tempDB: ${event.target.errorCode}`);
};

/***** Helper Functions ******/

// This function is called when unable to send transaction to server
// It will save the transaction to the local indexedDB temporarily 
// until connection is re-established
function saveRecord(transaction){
    // get indexedDB access
    const dbTransaction = tempDB.transaction(["pending"], "readwrite");
    const store = dbTransaction.objectStore("pending");
    // add transaction
    store.add(transaction);

}

function syncTempDB(){
    // get indexedDB access
    const dbTransaction = tempDB.transaction(["pending"], "readwrite");
    const store = dbTransaction.objectStore("pending");
    // get transactions
    const transactions = store.getAll();

    transactions.onsuccess = function(){
        if(transactions.result.length > 0) {
            fetch("/api/transaction/bulk", 
                {
                    method: "POST",
                    body: JSON.stringify(transactions.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                }
            )
            // .then((response)=> {return response.json();})
            .then((response)=>{
                // Clear indexedDB of pending transactions
                const dbTransaction = tempDB.transaction(["pending"], "readwrite");
                const store = dbTransaction.objectStore("pending");
                store.clear();
                return response.json();
            });
        }
    };
}