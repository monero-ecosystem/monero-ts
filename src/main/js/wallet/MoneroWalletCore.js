const FS = require('fs'); 

/**
 * Implements a MoneroWallet using WebAssembly to bridge to monero-project's wallet2.
 * 
 * TODO: add assertNotClosed() per JNI
 */
class MoneroWalletCore extends MoneroWalletKeys {
  
  // --------------------------- STATIC UTILITIES -----------------------------
  
  static async walletExists(path) {
    let temp = FS.existsSync(path);
    console.log("Wallet exists at " + path + ": " + temp);
    return FS.existsSync(path);
  }
  
  // TODO: openWith(<file/zip buffers>)
  
  static async openWallet(path, password, networkType, daemonUriOrConnection) {
    
    // validate and sanitize parameters
    if (!(await MoneroWalletCore.walletExists(path))) throw new MoneroError("Wallet does not exist at path: " + path);
    if (networkType === undefined) throw new MoneroError("Must provide a network type");
    MoneroNetworkType.validate(networkType);
    let daemonConnection = daemonUriOrConnection ? (typeof daemonUriOrConnection === "string" ? new MoneroRpcConnection(daemonUriOrConnection) : daemonUriOrConnection) : undefined;
    let daemonUri = daemonConnection ? daemonConnection.getUri() : "";
    let daemonUsername = daemonConnection ? daemonConnection.getUsername() : "";
    let daemonPassword = daemonConnection ? daemonConnection.getPassword() : "";
    
    // read wallet files
    let keysData = FS.readFileSync(path + ".keys");
    let cacheData = FS.readFileSync(path);
    
    // load wasm module
    let module = await MoneroUtils.getWasmModule();
    
    // return promise which is resolved on callback
    return new Promise(function(resolve, reject) {
      
      // define callback for wasm
      let callbackFn = async function(cppAddress) {
        let wallet = new MoneroWalletCore(cppAddress, path, password);
        resolve(wallet);
      };
      
      // create wallet in wasm and invoke callback when done
      module.open_core_wallet("", password === undefined ? "" : password, networkType, keysData, cacheData, daemonUri, daemonUsername, daemonPassword, callbackFn);    // empty path is provided so disk writes only happen from JS
    });
  }
  
  static async createWalletRandom(path, password, networkType, daemonConnection, language) {
    
    // validate and sanitize params
    if (path === undefined) path = "";
    MoneroNetworkType.validate(networkType);
    if (language === undefined) language = "English";
    let daemonUri = daemonConnection ? daemonConnection.getUri() : "";
    let daemonUsername = daemonConnection ? daemonConnection.getUsername() : "";
    let daemonPassword = daemonConnection ? daemonConnection.getPassword() : "";
    
    // load wasm module
    let module = await MoneroUtils.getWasmModule();
    
    // return promise which is resolved on callback
    return new Promise(function(resolve, reject) {
      
      // define callback for wasm
      let callbackFn = async function(cppAddress) {
        let wallet = new MoneroWalletCore(cppAddress, path, password);
        //await wallet.save();  // TODO
        resolve(wallet);
      };
      
      // create wallet in wasm and invoke callback when done
      module.create_core_wallet_random("", password === undefined ? "" : password, networkType, daemonUri, daemonUsername, daemonPassword, language, callbackFn);    // empty path is provided so disk writes only happen from JS
    });
  }
  
  // TODO: update to be consistent with createWalletRandom()
  static async createWalletFromMnemonic(path, password, networkType, mnemonic, daemonConnection, restoreHeight, seedOffset) {
    
    // load wasm module
    let module = await MoneroUtils.getWasmModule();
    
    // return promise which is resolved on callback
    return new Promise(function(resolve, reject) {
      
      // define callback for wasm
      let callbackFn = async function(cppAddress) {
        let wallet = new MoneroWalletCore(cppAddress, path, password);
        //await wallet.save();  // TODO
        resolve(wallet);
      };
      
      // create wallet in wasm and invoke callback when done
      let daemonUri = daemonConnection ? daemonConnection.getUri() : "";
      let daemonUsername = daemonConnection ? daemonConnection.getUsername() : "";
      let daemonPassword = daemonConnection ? daemonConnection.getPassword() : "";
      if (seedOffset === undefined) seedOffset = "";
      module.create_core_wallet_from_mnemonic("", password, networkType, mnemonic, daemonUri, daemonUsername, daemonPassword, restoreHeight, seedOffset, callbackFn);  // empty path is provided so disk writes only happen from JS
    });
  }
  
  // --------------------------- INSTANCE METHODS -----------------------------
  
  /**
   * Internal constructor which is given the memory address of a C++ wallet
   * instance.
   * 
   * This method should not be called externally but should be called through
   * static wallet creation utilities in this class.
   * 
   * @param {int} cppAddress is the address of the wallet instance in C++
   * @param {string} path is the path of the wallet instance
   * @param {string} password is the password of the wallet instance
   */
  constructor(cppAddress, path, password) {
    super(cppAddress);
    this.path = path;
    this.password = password;
    this.module = MoneroUtils.WASM_MODULE;
    if (!this.module.create_core_wallet_from_mnemonic) throw new Error("WASM module not loaded - create wallet instance using static utilities");  // static utilites pre-load wasm module
  }
  
  async getPath() {
    return this.path;
  }
  
  async getHeight() {
    let that = this;
    
    // return promise which resolves on callback
    return new Promise(function(resolve, reject) {
      
      // define callback for wasm
      let callbackFn = function(resp) {
        resolve(resp);
      }
      
      // sync wallet in wasm and invoke callback when done
      that.module.get_height(that.cppAddress, callbackFn);
    });
  }
  
  // getDaemonHeight
  
  async sync() {
    let that = this;
    
    // return promise which resolves on callback
    return new Promise(function(resolve, reject) {
      
      // define callback for wasm
      let callbackFn = function(resp) {
        console.log("MoneroWalletCore callback called!");
        console.log(resp);
        let respJson = JSON.parse(resp);
        let result = new MoneroSyncResult(respJson.numBlocksFetched, respJson.receivedMoney);
        resolve(result);
      }
      
      // sync wallet in wasm and invoke callback when done
      that.module.sync(that.cppAddress, callbackFn);
    });
  }
  
  // startSyncing
  // rescanSpent
  // rescanBlockchain
  
  async getBalance(accountIdx, subaddressIdx) {
    
    // get balance encoded in json string
    let balanceStr;
    if (accountIdx === undefined) {
      assert(subaddressIdx === undefined, "Subaddress index must be undefined if account index is undefined");
      balanceStr = this.module.get_balance_wallet(this.cppAddress);
    } else if (subaddressIdx === undefined) {
      balanceStr = this.module.get_balance_account(this.cppAddress, accountIdx);
    } else {
      balanceStr = this.module.get_balance_subaddress(this.cppAddress, accountIdx, subaddressIdx);
    }
    
    // parse json string to BigInteger
    return new BigInteger(JSON.parse(balanceStr).balance);
  }
  
  async getUnlockedBalance(accountIdx, subaddressIdx) {
    
    // get balance encoded in json string
    let unlockedBalanceStr;
    if (accountIdx === undefined) {
      assert(subaddressIdx === undefined, "Subaddress index must be undefined if account index is undefined");
      unlockedBalanceStr = this.module.get_unlocked_balance_wallet(this.cppAddress);
    } else if (subaddressIdx === undefined) {
      unlockedBalanceStr = this.module.get_unlocked_balance_account(this.cppAddress, accountIdx);
    } else {
      unlockedBalanceStr = this.module.get_unlocked_balance_subaddress(this.cppAddress, accountIdx, subaddressIdx);
    }
    
    // parse json string to BigInteger
    return new BigInteger(JSON.parse(unlockedBalanceStr).unlockedBalance);
  }
  
  async getAccounts(includeSubaddresses, tag) {
    let accountsStr = this.module.get_accounts(this.cppAddress, includeSubaddresses ? true : false, tag ? tag : "");
    let accounts = [];
    for (let accountJson of JSON.parse(accountsStr).accounts) {
      accounts.push(MoneroWalletCore._sanitizeAccount(new MoneroAccount(accountJson)));
//      console.log("Account balance: " + accountJson.balance);
//      console.log("Account unlocked balance: " + accountJson.unlockedBalance);
//      console.log("Account balance BI: " + new BigInteger(accountJson.balance));
//      console.log("Account unlocked balance BI: " + new BigInteger(accountJson.unlockedBalance));
    }
    return accounts;
  }
  
  async getAccount(accountIdx, includeSubaddresses) {
    let accountStr = this.module.get_account(this.cppAddress, accountIdx, includeSubaddresses ? true : false);
    let accountJson = JSON.parse(accountStr);
    return MoneroWalletCore._sanitizeAccount(new MoneroAccount(accountJson));
  }
  
  async createAccount(label) {
    throw new MoneroError("Not implemented");
  }
  
  async getSubaddresses(accountIdx, subaddressIndices) {
    let args = {accountIdx: accountIdx, subaddressIndices: subaddressIndices === undefined ? [] : GenUtils.listify(subaddressIndices)};
    let subaddressesJson = JSON.parse(this.module.get_subaddresses(this.cppAddress, JSON.stringify(args))).subaddresses;
    let subaddresses = [];
    for (let subaddressJson of subaddressesJson) subaddresses.push(MoneroWalletCore._sanitizeSubaddress(new MoneroSubaddress(subaddressJson)));
    return subaddresses;
  }
  
  async createSubaddress(accountIdx, label) {
    throw new MoneroError("Not implemented");
  }
  
  async getTxs(query) {
    
    // copy and normalize tx query up to block
    if (query instanceof MoneroTxQuery) query = query.copy();
    else if (Array.isArray(query)) query = new MoneroTxQuery().setTxHashes(query);
    else {
      query = Object.assign({}, query);
      query = new MoneroTxQuery(query);
    }
    if (query.getBlock() === undefined) query.setBlock(new MoneroBlock().setTxs([query]));
    if (query.getTransferQuery() === undefined) query.setTransferQuery(new MoneroTransferQuery());
    if (query.getOutputQuery() === undefined) query.setOutputQuery(new MoneroOutputQuery());
    
    // return promise which resolves on callback
    let that = this;
    return new Promise(function(resolve, reject) {
      
      // define callback for wasm
      let callbackFn = function(blocksJsonStr) {
        
        // check for error  // TODO: return {blocks: [...], errorMsg: "..."} then parse and check for it
        if (blocksJsonStr.charAt(0) !== "{") {
          reject(new MoneroError(blocksJsonStr));
          return;
        }
        
        // deserialize blocks
        let blocks = MoneroWalletCore._deserializeBlocks(blocksJsonStr);
        
        // collect txs
        let txs = [];
        for (let block of blocks) {
            MoneroWalletCore._sanitizeBlock(block); // TODO: this should be part of deserializeBlocks()
            for (let tx of block.getTxs()) {
            if (block.getHeight() === undefined) tx.setBlock(undefined); // dereference placeholder block for unconfirmed txs
            txs.push(tx);
          }
        }
      
        // re-sort txs which is lost over wasm serialization
        if (query.getTxHashes() !== undefined) {
          let txMap = new Map();
          for (let tx of txs) txMap[tx.getHash()] = tx;
          let txsSorted = [];
          for (let txHash of query.getTxHashes()) txsSorted.push(txMap[txHash]);
          txs = txsSorted;
        }
        
        // resolve promise with txs
        resolve(txs);
      }
      
      // sync wallet in wasm and invoke callback when done
      that.module.get_txs(that.cppAddress, JSON.stringify(query.getBlock().toJson()), callbackFn);
    });
  }
  
  async getTransfers(config) {
    throw new MoneroError("Not implemented");
  }
  
  async getIncomingTransfers(config) {
    throw new MoneroError("Not implemented");
  }
  
  async getOutgoingTransfers(config) {
    throw new MoneroError("Not implemented");
  }
  
  async getOutputs(config) {
    throw new MoneroError("Not implemented");
  }
  
  async getOutputsHex() {
    throw new MoneroError("Not implemented");
  }
  
  async importOutputsHex(outputsHex) {
    throw new MoneroError("Not implemented");
  }
  
  async getKeyImages() {
    throw new MoneroError("Not implemented");
  }
  
  async importKeyImages(keyImages) {
    throw new MoneroError("Not implemented");
  }
  
  async getNewKeyImagesFromLastImport() {
    throw new MoneroError("Not implemented");
  }
  
  async relayTxs(txsOrMetadatas) {
    throw new MoneroError("Not implemented");
  }
  
  async sendSplit(requestOrAccountIndex, address, amount, priority) {
    
    // validate, copy, and normalize request  // TODO: this is copied from MoneroWalletRpc.sendSplit(), factor to super class which calls this with normalized request?
    let request;
    if (requestOrAccountIndex instanceof MoneroSendRequest) {
      assert.equal(arguments.length, 1, "Sending requires a send request or parameters but not both");
      request = requestOrAccountIndex;
    } else {
      if (requestOrAccountIndex instanceof Object) request = new MoneroSendRequest(requestOrAccountIndex);
      else request = new MoneroSendRequest(requestOrAccountIndex, address, amount, priority);
    }
    assert.notEqual(request.getDestinations(), undefined, "Must specify destinations");
    assert.equal(request.getSweepEachSubaddress(), undefined);
    assert.equal(request.getBelowAmount(), undefined);
    if (request.getCanSplit() === undefined) {
      request = request.copy();
      request.setCanSplit(true);
    }
    
    // return promise which resolves on callback
    let that = this;
    return new Promise(function(resolve, reject) {
      
      // define callback for wasm
      let callbackFn = function(txSetJsonStr) {
        
        // json string expected // TODO: use error handling when supported in wasm
        if (txSetJsonStr.charAt(0) !== '{') throw new Error(txSetJsonStr);
        
        // deserialize tx set
        let txSet = new MoneroTxSet(JSON.parse(txSetJsonStr));
        resolve(txSet);
      }
      
      // sync wallet in wasm and invoke callback when done
      that.module.send_split(that.cppAddress, JSON.stringify(request.toJson()), callbackFn);
    });
  }
  
  async sweepOutput(requestOrAddress, keyImage, priority) {
    throw new MoneroError("Not implemented");
  }

  async sweepUnlocked(request) {
    throw new MoneroError("Not implemented");
  }
  
  async sweepDust() {
    throw new MoneroError("Not implemented");
  }
  
  async sweepDust(doNotRelay) {
    throw new MoneroError("Not implemented");
  }
  
  async sign(message) {
    throw new MoneroError("Not implemented");
  }
  
  async verify(message, address, signature) {
    throw new MoneroError("Not implemented");
  }
  
  async getTxKey(txHash) {
    throw new MoneroError("Not implemented");
  }
  
  async checkTxKey(txHash, txKey, address) {
    throw new MoneroError("Not implemented");
  }
  
  async getTxProof(txHash, address, message) {
    throw new MoneroError("Not implemented");
  }
  
  async checkTxProof(txHash, address, message, signature) {
    throw new MoneroError("Not implemented");
  }
  
  async getSpendProof(txHash, message) {
    throw new MoneroError("Not implemented");
  }
  
  async checkSpendProof(txHash, message, signature) {
    throw new MoneroError("Not implemented");
  }
  
  async getReserveProofWallet(message) {
    throw new MoneroError("Not implemented");
  }
  
  async getReserveProofAccount(accountIdx, amount, message) {
    throw new MoneroError("Not implemented");
  }

  async checkReserveProof(address, message, signature) {
    throw new MoneroError("Not implemented");
  }
  
  async getTxNotes(txHashes) {
    throw new MoneroError("Not implemented");
  }
  
  async setTxNotes(txHashes, notes) {
    throw new MoneroError("Not implemented");
  }
  
  async getAddressBookEntries() {
    throw new MoneroError("Not implemented");
  }
  
  async getAddressBookEntries(entryIndices) {
    throw new MoneroError("Not implemented");
  }
  
  async addAddressBookEntry(address, description) {
    throw new MoneroError("Not implemented");
  }
  
  async addAddressBookEntry(address, description, paymentId) {
    throw new MoneroError("Not implemented");
  }
  
  async deleteAddressBookEntry(entryIdx) {
    throw new MoneroError("Not implemented");
  }
  
  async tagAccounts(tag, accountIndices) {
    throw new MoneroError("Not implemented");
  }

  async untagAccounts(accountIndices) {
    throw new MoneroError("Not implemented");
  }
  
  async getAccountTags() {
    throw new MoneroError("Not implemented");
  }

  async setAccountTagLabel(tag, label) {
    throw new MoneroError("Not implemented");
  }
  
  async createPaymentUri(request) {
    throw new MoneroError("Not implemented");
  }
  
  async parsePaymentUri(uri) {
    throw new MoneroError("Not implemented");
  }
  
  async getAttribute(key) {
    assert(typeof key === "string", "Attribute key must be a string");
    let value = this.module.get_attribute(this.cppAddress, key);
    return value === "" ? undefined : value;
  }
  
  async setAttribute(key, val) {
    assert(typeof key === "string", "Attribute key must be a string");
    assert(typeof val === "string", "Attribute value must be a string");
    this.module.set_attribute(this.cppAddress, key, val);
  }
  
  async startMining(numThreads, backgroundMining, ignoreBattery) {
    throw new MoneroError("Not implemented");
  }
  
  async stopMining() {
    throw new MoneroError("Not implemented");
  }
  
  async isMultisigImportNeeded() {
    throw new MoneroError("Not implemented");
  }
  
  async isMultisig() {
    throw new MoneroError("Not implemented");
  }
  
  async getMultisigInfo() {
    throw new MoneroError("Not implemented");
  }
  
  async prepareMultisig() {
    throw new MoneroError("Not implemented");
  }
  
  async makeMultisig(multisigHexes, threshold, password) {
    throw new MoneroError("Not implemented");
  }
  
  async exchangeMultisigKeys(multisigHexes, password) {
    throw new MoneroError("Not implemented");
  }
  
  async getMultisigHex() {
    throw new MoneroError("Not implemented");
  }
  
  async importMultisigHex(multisigHexes) {
    throw new MoneroError("Not implemented");
  }
  
  async signMultisigTxHex(multisigTxHex) {
    throw new MoneroError("Not implemented");
  }
  
  async submitMultisigTxHex(signedMultisigTxHex) {
    throw new MoneroError("Not implemented");
  }

  async save() {
    
    // path must be set
    let path = await this.getPath();
    if (path === "") throw new MoneroError("Wallet path is not set");
    
    // write address file
    FS.writeFileSync(path + "_address.txt", this.module.get_address_file_buffer(this.cppAddress));
    
    // malloc keys buffer and get buffer location in c++ heap
    let keysBufferLoc = JSON.parse(this.module.get_keys_file_buffer(this.cppAddress, this.password, false));
    
    // read binary data from heap to DataView
    let view = new DataView(new ArrayBuffer(keysBufferLoc.length)); // TODO: improve performance using DataView instead of Uint8Array?, TODO: rename to length
    for (let i = 0; i < keysBufferLoc.length; i++) {
      view.setInt8(i, this.module.HEAPU8[keysBufferLoc.pointer / Uint8Array.BYTES_PER_ELEMENT + i]);
    }
    
    // free binary on heap
    this.module._free(keysBufferLoc.pointer);
    
    // write keys file
    FS.writeFileSync(path + ".keys", view, "binary"); // TODO: make async with callback?
    
    // malloc cache buffer and get buffer location in c++ heap
    let cacheBufferLoc = JSON.parse(this.module.get_cache_file_buffer(this.cppAddress, this.password));
    
    // read binary data from heap to DataView
    view = new DataView(new ArrayBuffer(cacheBufferLoc.length));
    for (let i = 0; i < cacheBufferLoc.length; i++) {
      view.setInt8(i, this.module.HEAPU8[cacheBufferLoc.pointer / Uint8Array.BYTES_PER_ELEMENT + i]);
    }
    
    // free binary on heap
    this.module._free(cacheBufferLoc.pointer);
    
    // write cache file
    FS.writeFileSync(path, view, "binary");
  }
  
  async close(save) {
    if (save) await this.save();
    delete this.path;
    delete this.password;
    this.module.close(this.cppAddress);
    delete this.cppAddress;
  }
  
  // ---------------------------- PRIVATE HELPERS ----------------------------
  
  static _sanitizeBlock(block) {
    for (let tx of block.getTxs()) MoneroWalletCore._sanitizeTxWallet(tx);
    return block;
  }
  
  static _sanitizeTxWallet(tx) {
    assert(tx instanceof MoneroTxWallet);
    return tx;
  }
  
  static _sanitizeAccount(account) {
    if (account.getSubaddresses()) {
      for (let subaddress of account.getSubaddresses()) MoneroWalletCore._sanitizeSubaddress(subaddress);
    }
    return account;
  }
  
  static _sanitizeSubaddress(subaddress) {
    if (subaddress.getLabel() === "") subaddress.setLabel(undefined);
    return subaddress
  }
  
  static _deserializeBlocks(blocksJsonStr) {
    
    // parse string to json
    let blocksJson = JSON.parse(blocksJsonStr);
    
    // initialize blocks
    let blocks = [];
    for (let blockJson of blocksJson.blocks) {
      blocks.push(new MoneroBlock(blockJson, true));
    }
    return blocks
  }
}

module.exports = MoneroWalletCore;