/**
 * Collection of Monero utilities.
 */
class MoneroUtils {
  
  /**
   * Loads the WebAssembly module one time.
   */
  static async loadWasmModule() {
    if (MoneroUtils.WASM_MODULE === undefined) {
      MoneroUtils.WASM_MODULE = await require("../../../../build/monero-javascript-wasm")().ready;
      
      // initialize promise queue to synchronize wasm requests
      const async = require("async");
      
      MoneroUtils.WASM_MODULE.taskQueue = async.queue(function(asyncFn, callback) {
        if (asyncFn.then) throw new Error("Can only queue asynchronous functions");
        asyncFn().then(resp => { callback(resp); }).catch(err => { callback(undefined, err); });
      }, 1);
      
      MoneroUtils.WASM_MODULE.queueTask = async function(asyncFn) {  // taskFn is an async function to execute
        return new Promise(function(resolve, reject) {
          MoneroUtils.WASM_MODULE.taskQueue.push(asyncFn, function(resp, err) {
            if (err !== undefined) reject(err);
            else resolve(resp);
          });
        });
      }
      
//      MoneroUtils.WASM_MODULE._promiseQueue = async.queue(function(promiseFn, callback) {  // TODO: change to promise instead of promiseFn?
//        promiseFn().then(resp => { callback(resp); }).catch(err => { callback(undefined, err) });
//      }, 1);
//      
//      // initialize method to synchronize wasm requests
//      MoneroUtils.WASM_MODULE._queuePromise = function(promise) { // TODO: promise could become function(resolve, reject)
//        return new Promise(function(resolve, reject) {
//          MoneroUtils.WASM_MODULE._promiseQueue.push(function() { // change from function to promise?
//            return promise;
//          }, function(resp, err) {
//            if (resp !== undefined) resolve(resp);
//            else reject(err);
//          });
//        });
//      }
    }
    return MoneroUtils.WASM_MODULE;
  }
  
  // TODO: beef this up
  static validateMnemonic(mnemonic) {
    assert(mnemonic, "Mnemonic phrase is not initialized");
    let words = mnemonic.split(" ");
    if (words.length !== MoneroUtils.NUM_MNEMONIC_WORDS) throw new Error("Mnemonic phrase is " + words.length + " words but must be " + MoneroUtils.NUM_MNEMONIC_WORDS);
  }
  
  // TODO: beef this up
  static validatePrivateViewKey(privateViewKey) {
    assert(typeof privateViewKey === "string");
    assert(privateViewKey.length === 64);
  }
  
  // TODO: beef this up
  static validatePrivateSpendKey(privateSpendKey) {
    assert(typeof privateSpendKey === "string");
    assert(privateSpendKey.length === 64);
  }
  
  // TODO: beef this up
  static validatePublicViewKey(publicViewKey) {
    assert(typeof publicViewKey === "string");
    assert(publicViewKey.length === 64);
  }
  
  // TODO: beef this up
  static validatePublicSpendKey(publicSpendKey) {
    assert(typeof publicSpendKey === "string");
    assert(publicSpendKey.length === 64);
  }
  
  // TODO: beef this up, will require knowing network type
  static validateAddress(address) {
    assert(address);
    assert(address.length > 0);
  }
  
  static isValidPaymentId(paymentId) {
    try {
      MoneroUtils.validatePaymentId(paymentId);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  
  // TODO: beef this up
  static validatePaymentId(paymentId) {
    assert.equal(typeof paymentId, "string");
    assert(paymentId.length === 16 || paymentId.length === 64);
  }
    
  /**
   * Decodes tx extra according to https://cryptonote.org/cns/cns005.txt and
   * returns the last tx pub key.
   * 
   * TODO: use c++ bridge for this
   * 
   * @param txExtra is an array of tx extra bytes
   * @return the last pub key as a hexidecimal string
   */
  static getLastTxPubKey(txExtra) {
    let lastPubKeyIdx;
    for (let i = 0; i < txExtra.length; i++) {
      let tag = txExtra[i];
      if (tag === 0 || tag === 2) {
        i += 1 + txExtra[i + 1];  // advance to next tag
      } else if (tag === 1) {
        lastPubKeyIdx = i + 1;
        i += 1 + 32;              // advance to next tag
      } else throw new Error("Invalid sub-field tag: " + tag);
    }
    return Buffer.from(new Uint8Array(txExtra.slice(lastPubKeyIdx, lastPubKeyIdx + 32))).toString("hex");
  }
  
  /**
   * Determines if two payment ids are functionally equal.
   * 
   * For example, 03284e41c342f032 and 03284e41c342f032000000000000000000000000000000000000000000000000 are considered equal.
   * 
   * @param paymentId1 is a payment id to compare
   * @param paymentId2 is a payment id to compare
   * @return true if the payment ids are equal, false otherwise
   */
  static paymentIdsEqual(paymentId1, paymentId2) {
    let maxLength = Math.max(paymentId1.length, paymentId2.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < paymentId1.length && i < paymentId2.length && paymentId1[i] !== paymentId2[i]) return false;
      if (i >= paymentId1.length && paymentId2[i] !== '0') return false;
      if (i >= paymentId2.length && paymentId1[i] !== '0') return false;
    }
    return true;
  }
  
  /**
   * Merges a transaction into a list of existing transactions.
   * 
   * @param txs are existing transactions to merge into
   * @param tx is the transaction to merge into the list
   */
  static mergeTx(txs, tx) {
    for (let aTx of txs) {
      if (aTx.getHash() === tx.getHash()) {
        aTx.merge(tx);
        return;
      }
    }
    txs.push(tx);
  }
  
  /**
   * Converts the given JSON to a binary Uint8Array using Monero's portable storage format.
   * 
   * @param json is the json to convert to binary
   * @returns Uint8Array is the json converted to portable storage binary
   */
  static jsonToBinary(json) {
    
    // wasm module must be pre-loaded
    if (MoneroUtils.WASM_MODULE === undefined) throw MoneroError("WASM module is not loaded; call 'await MoneroUtils.loadWasmModule()' to load");
    
    // serialize json to binary which is stored in c++ heap
    let binMemInfoStr = MoneroUtils.WASM_MODULE.malloc_binary_from_json(JSON.stringify(json));
    
    // sanitize binary memory address info
    let binMemInfo = JSON.parse(binMemInfoStr);
    binMemInfo.ptr = parseInt(binMemInfo.ptr);
    binMemInfo.length = parseInt(binMemInfo.length);
    
    // read binary data from heap to Uint8Array
    let view = new Uint8Array(binMemInfo.length);
    for (let i = 0; i < binMemInfo.length; i++) {
      view[i] = MoneroUtils.WASM_MODULE.HEAPU8[binMemInfo.ptr / Uint8Array.BYTES_PER_ELEMENT + i];
    }
    
    // free binary on heap
    MoneroUtils.WASM_MODULE._free(binMemInfo.ptr);
    
    // return json from binary data
    return view;
  }
  
  /**
   * Converts the given portable storage binary to JSON.
   * 
   * @param uint8arr is a Uint8Array with binary data in Monero's portable storage format
   * @returns a JSON object converted from the binary data
   */
  static binaryToJson(uint8arr) {
    
    // wasm module must be pre-loaded
    if (MoneroUtils.WASM_MODULE === undefined) throw MoneroError("WASM module is not loaded; call 'await MoneroUtils.loadWasmModule()' to load");
    
    // allocate space in c++ heap for binary
    let ptr = MoneroUtils.WASM_MODULE._malloc(uint8arr.length * uint8arr.BYTES_PER_ELEMENT);
    let heap = new Uint8Array(MoneroUtils.WASM_MODULE.HEAPU8.buffer, ptr, uint8arr.length * uint8arr.BYTES_PER_ELEMENT);
    
    // write binary to heap
    heap.set(new Uint8Array(uint8arr.buffer));
    
    // create object with binary memory address info
    let binMemInfo = { ptr: ptr, length: uint8arr.length  }

    // convert binary to json str
    const ret_string = MoneroUtils.WASM_MODULE.binary_to_json(JSON.stringify(binMemInfo));
    
    // free binary on heap
    MoneroUtils.WASM_MODULE._free(heap.byteOffset);
    MoneroUtils.WASM_MODULE._free(ptr);
    
    // parse and return json
    return JSON.parse(ret_string);
  }
  
  /**
   * Converts the binary response from daemon RPC block retrieval to JSON.
   * 
   * @param uint8arr is the binary response from daemon RPC when getting blocks
   * @returns a JSON object with the blocks data
   */
  static binaryBlocksToJson(uint8arr) {
    
    // wasm module must be pre-loaded
    if (MoneroUtils.WASM_MODULE === undefined) throw MoneroError("WASM module is not loaded; call 'await MoneroUtils.loadWasmModule()' to load");
    
    // allocate space in c++ heap for binary
    let ptr = MoneroUtils.WASM_MODULE._malloc(uint8arr.length * uint8arr.BYTES_PER_ELEMENT);  // TODO: this needs deleted
    let heap = new Uint8Array(MoneroUtils.WASM_MODULE.HEAPU8.buffer, ptr, uint8arr.length * uint8arr.BYTES_PER_ELEMENT);
    
    // write binary to heap
    heap.set(new Uint8Array(uint8arr.buffer));
    
    // create object with binary memory address info
    let binMemInfo = { ptr: ptr, length: uint8arr.length  }

    // convert binary to json str
    const json_str = MoneroUtils.WASM_MODULE.binary_blocks_to_json(JSON.stringify(binMemInfo));
    
    // free memory
    MoneroUtils.WASM_MODULE._free(heap.byteOffset);
    MoneroUtils.WASM_MODULE._free(ptr);
    
    // parse result to json
    let json = JSON.parse(json_str);                                          // parsing json gives arrays of block and tx strings
    json.blocks = json.blocks.map(blockStr => JSON.parse(blockStr));          // replace block strings with parsed blocks
    json.txs = json.txs.map(txs => txs ? txs.map(tx => JSON.parse(tx.replace(",", "{") + "}")) : []); // modify tx string to proper json and parse // TODO: more efficient way than this json manipulation?
    return json;
  }
}

MoneroUtils.NUM_MNEMONIC_WORDS = 25;
MoneroUtils.WALLET_REFRESH_RATE = 10000;  // 10 seconds
MoneroUtils.RING_SIZE = 12;

module.exports = MoneroUtils;