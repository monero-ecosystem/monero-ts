"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _assert = _interopRequireDefault(require("assert"));
var _MoneroDestination = _interopRequireDefault(require("./MoneroDestination"));
var _MoneroError = _interopRequireDefault(require("../../common/MoneroError"));


/**
 * Configures a transaction to send, sweep, or create a payment URI.
 */
class MoneroTxConfig {

  /** Single destination address (required unless `destinations` provided). */


  /** Single destination amount (required unless `destinations provided). */


  /** Source account index to transfer funds from (required unless sweeping key image). */


  /** Source subaddress index to send funds from (default all). */


  /** Source subaddresses to send funds from (default all). */


  /** Relay the transaction to peers to commit to the blockchain if true (default false). */


  /** Transaction priority to adjust the miner fee (default MoneroTxPriority.NORMAL). */


  /** Multiple destinations to send funds to, if applicable. */


  /** List of destination indices to split the miner fee (optional). */


  /** Payment ID for the transaction. */


  /** Miner fee (calculated automatically). */


  /** Transaction note saved locally with the wallet (optional). */


  /** Recipient name saved locally with the wallet (optional). */


  /** Allow funds to be transferred using multiple transactions if necessary (default false). */


  /** For sweep requests, include outputs below this amount when sweeping wallet, account, subaddress, or all unlocked funds. */


  /** For sweep requests, sweep each subaddress individually instead of together if true. */


  /** For sweep requests, key image of the output to sweep. */


  /**
   * <p>Generic request to transfer funds from a wallet.</p>
   * 
   * <p>Example:</p>
   * 
   * <code>
   * let config1 = new MoneroTxConfig({<br>
   * &nbsp;&nbsp; accountIndex: 0,<br>
   * &nbsp;&nbsp; address: "59aZULsUF3YN...",<br>
   * &nbsp;&nbsp; amount: 500000n,<br>
   * &nbsp;&nbsp; priority: MoneroTxPriority.NORMAL,<br>
   * &nbsp;&nbsp; relay: true<br>
   * });
   * </code>
   * 
   * @param {Partial<MoneroTxConfig>} [config] - configures the transaction to create (optional)
   * @param {string} [config.address] - single destination address
   * @param {bigint} [config.amount] - single destination amount
   * @param {number} [config.accountIndex] - source account index to transfer funds from
   * @param {number} [config.subaddressIndex] - source subaddress index to transfer funds from
   * @param {number[]} [config.subaddressIndices] - source subaddress indices to transfer funds from
   * @param {boolean} [config.relay] - relay the transaction to peers to commit to the blockchain
   * @param {MoneroTxPriority} [config.priority] - transaction priority (default MoneroTxPriority.NORMAL)
   * @param {MoneroDestination[]} [config.destinations] - addresses and amounts in a multi-destination tx
   * @param {number[]} [config.subtractFeeFrom] - list of destination indices to split the transaction fee
   * @param {string} [config.paymentId] - transaction payment ID
   * @param {bigint} [config.unlockTime] - minimum height or timestamp for the transaction to unlock (default 0)
   * @param {string} [config.note] - transaction note saved locally with the wallet
   * @param {string} [config.recipientName] - recipient name saved locally with the wallet
   * @param {boolean} [config.canSplit] - allow funds to be transferred using multiple transactions
   * @param {bigint} [config.belowAmount] - for sweep requests, include outputs below this amount when sweeping wallet, account, subaddress, or all unlocked funds 
   * @param {boolean} [config.sweepEachSubaddress] - for sweep requests, sweep each subaddress individually instead of together if true
   * @param {string} [config.keyImage] - key image to sweep (ignored except in sweepOutput() requests)
   */
  constructor(config) {
    Object.assign(this, config);

    // deserialize bigints
    if (this.amount !== undefined && typeof this.amount !== "bigint") this.amount = BigInt(this.amount);
    if (this.fee !== undefined && typeof this.fee !== "bigint") this.fee = BigInt(this.fee);
    if (this.belowAmount !== undefined && typeof this.belowAmount !== "bigint") this.belowAmount = BigInt(this.belowAmount);

    // copy destinations
    if (this.destinations) {
      (0, _assert.default)(this.address === undefined && this.amount === undefined, "Tx configuration may specify destinations or an address/amount but not both");
      this.setDestinations(this.destinations.map((destination) => new _MoneroDestination.default(destination)));
    }

    // alias 'address' and 'amount' to single destination to support e.g. createTx({address: "..."})
    if (this.address || this.amount) {
      (0, _assert.default)(!this.destinations, "Tx configuration may specify destinations or an address/amount but not both");
      this.setAddress(this.address);
      this.setAmount(this.amount);
      delete this.address;
      delete this.amount;
    }

    // alias 'subaddressIndex' to subaddress indices
    if (this.subaddressIndex !== undefined) {
      this.setSubaddressIndices([this.subaddressIndex]);
      delete this.subaddressIndex;
    }
  }

  copy() {
    return new MoneroTxConfig(this);
  }

  toJson() {
    let json = Object.assign({}, this); // copy state
    if (this.getDestinations() !== undefined) {
      json.destinations = [];
      for (let destination of this.getDestinations()) json.destinations.push(destination.toJson());
    }
    if (this.getFee()) json.fee = this.getFee().toString();
    if (this.getBelowAmount()) json.belowAmount = this.getBelowAmount().toString();
    return json;
  }

  /**
   * Set the address of a single-destination configuration.
   * 
   * @param {string} address - the address to set for the single destination
   * @return {MoneroTxConfig} this configuration for chaining
   */
  setAddress(address) {
    if (this.destinations !== undefined && this.destinations.length > 1) throw new _MoneroError.default("Cannot set address because MoneroTxConfig already has multiple destinations");
    if (this.destinations === undefined || this.destinations.length === 0) this.addDestination(new _MoneroDestination.default(address));else
    this.destinations[0].setAddress(address);
    return this;
  }

  /**
   * Get the address of a single-destination configuration.
   * 
   * @return {string} the address of the single destination
   */
  getAddress() {
    if (this.destinations === undefined || this.destinations.length !== 1) throw new _MoneroError.default("Cannot get address because MoneroTxConfig does not have exactly one destination");
    return this.destinations[0].getAddress();
  }

  /**
   * Set the amount of a single-destination configuration.
   * 
   * @param {bigint} amount - the amount to set for the single destination
   * @return {MoneroTxConfig} this configuration for chaining
   */
  setAmount(amount) {
    if (amount !== undefined && typeof this.amount !== "bigint") {
      if (typeof amount === "number") throw new _MoneroError.default("Destination amount must be bigint or string");
      try {amount = BigInt(amount);}
      catch (err) {throw new _MoneroError.default("Invalid destination amount: " + amount);}
    }
    if (this.destinations !== undefined && this.destinations.length > 1) throw new _MoneroError.default("Cannot set amount because MoneroTxConfig already has multiple destinations");
    if (this.destinations === undefined || this.destinations.length === 0) this.addDestination(new _MoneroDestination.default(undefined, amount));else
    this.destinations[0].setAmount(amount);
    return this;
  }

  /**
   * Get the amount of a single-destination configuration.
   * 
   * @return {bigint} the amount of the single destination
   */
  getAmount() {
    if (this.destinations === undefined || this.destinations.length !== 1) throw new _MoneroError.default("Cannot get amount because MoneroTxConfig does not have exactly one destination");
    return this.destinations[0].getAmount();
  }

  addDestination(destinationOrAddress, amount) {
    if (typeof destinationOrAddress === "string") return this.addDestination(new _MoneroDestination.default(destinationOrAddress, amount));
    (0, _assert.default)(destinationOrAddress instanceof _MoneroDestination.default);
    if (this.destinations === undefined) this.destinations = [];
    this.destinations.push(destinationOrAddress);
    return this;
  }

  getDestinations() {
    return this.destinations;
  }

  setDestinations(destinations) {
    if (arguments.length > 1) destinations = Array.from(arguments);
    this.destinations = destinations;
    return this;
  }

  setDestination(destination) {
    return this.setDestinations(destination ? [destination] : undefined);
  }

  getSubtractFeeFrom() {
    return this.subtractFeeFrom;
  }

  setSubtractFeeFrom(destinationIndices) {
    if (arguments.length > 1) destinationIndices = Array.from(arguments);
    this.subtractFeeFrom = destinationIndices;
    return this;
  }

  getPaymentId() {
    return this.paymentId;
  }

  setPaymentId(paymentId) {
    this.paymentId = paymentId;
    return this;
  }

  getPriority() {
    return this.priority;
  }

  setPriority(priority) {
    this.priority = priority;
    return this;
  }

  getFee() {
    return this.fee;
  }

  setFee(fee) {
    this.fee = fee;
    return this;
  }

  getAccountIndex() {
    return this.accountIndex;
  }

  setAccountIndex(accountIndex) {
    this.accountIndex = accountIndex;
    return this;
  }

  setSubaddressIndex(subaddressIndex) {
    this.setSubaddressIndices([subaddressIndex]);
    return this;
  }

  getSubaddressIndices() {
    return this.subaddressIndices;
  }

  setSubaddressIndices(subaddressIndices) {
    if (arguments.length > 1) subaddressIndices = Array.from(arguments);
    this.subaddressIndices = subaddressIndices;
    return this;
  }

  getRelay() {
    return this.relay;
  }

  setRelay(relay) {
    this.relay = relay;
    return this;
  }

  getCanSplit() {
    return this.canSplit;
  }

  setCanSplit(canSplit) {
    this.canSplit = canSplit;
    return this;
  }

  getNote() {
    return this.note;
  }

  setNote(note) {
    this.note = note;
    return this;
  }

  getRecipientName() {
    return this.recipientName;
  }

  setRecipientName(recipientName) {
    this.recipientName = recipientName;
    return this;
  }

  // --------------------------- SPECIFIC TO SWEEP ----------------------------

  getBelowAmount() {
    return this.belowAmount;
  }

  setBelowAmount(belowAmount) {
    this.belowAmount = belowAmount;
    return this;
  }

  getSweepEachSubaddress() {
    return this.sweepEachSubaddress;
  }

  setSweepEachSubaddress(sweepEachSubaddress) {
    this.sweepEachSubaddress = sweepEachSubaddress;
    return this;
  }

  /**
   * Get the key image hex of the output to sweep.
   * 
   * return {string} is the key image hex of the output to sweep
   */
  getKeyImage() {
    return this.keyImage;
  }

  /**
   * Set the key image hex of the output to sweep.
   * 
   * @param {string} keyImage is the key image hex of the output to sweep
   */
  setKeyImage(keyImage) {
    this.keyImage = keyImage;
    return this;
  }
}exports.default = MoneroTxConfig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfYXNzZXJ0IiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJfTW9uZXJvRGVzdGluYXRpb24iLCJfTW9uZXJvRXJyb3IiLCJNb25lcm9UeENvbmZpZyIsImNvbnN0cnVjdG9yIiwiY29uZmlnIiwiT2JqZWN0IiwiYXNzaWduIiwiYW1vdW50IiwidW5kZWZpbmVkIiwiQmlnSW50IiwiZmVlIiwiYmVsb3dBbW91bnQiLCJkZXN0aW5hdGlvbnMiLCJhc3NlcnQiLCJhZGRyZXNzIiwic2V0RGVzdGluYXRpb25zIiwibWFwIiwiZGVzdGluYXRpb24iLCJNb25lcm9EZXN0aW5hdGlvbiIsInNldEFkZHJlc3MiLCJzZXRBbW91bnQiLCJzdWJhZGRyZXNzSW5kZXgiLCJzZXRTdWJhZGRyZXNzSW5kaWNlcyIsImNvcHkiLCJ0b0pzb24iLCJqc29uIiwiZ2V0RGVzdGluYXRpb25zIiwicHVzaCIsImdldEZlZSIsInRvU3RyaW5nIiwiZ2V0QmVsb3dBbW91bnQiLCJsZW5ndGgiLCJNb25lcm9FcnJvciIsImFkZERlc3RpbmF0aW9uIiwiZ2V0QWRkcmVzcyIsImVyciIsImdldEFtb3VudCIsImRlc3RpbmF0aW9uT3JBZGRyZXNzIiwiYXJndW1lbnRzIiwiQXJyYXkiLCJmcm9tIiwic2V0RGVzdGluYXRpb24iLCJnZXRTdWJ0cmFjdEZlZUZyb20iLCJzdWJ0cmFjdEZlZUZyb20iLCJzZXRTdWJ0cmFjdEZlZUZyb20iLCJkZXN0aW5hdGlvbkluZGljZXMiLCJnZXRQYXltZW50SWQiLCJwYXltZW50SWQiLCJzZXRQYXltZW50SWQiLCJnZXRQcmlvcml0eSIsInByaW9yaXR5Iiwic2V0UHJpb3JpdHkiLCJzZXRGZWUiLCJnZXRBY2NvdW50SW5kZXgiLCJhY2NvdW50SW5kZXgiLCJzZXRBY2NvdW50SW5kZXgiLCJzZXRTdWJhZGRyZXNzSW5kZXgiLCJnZXRTdWJhZGRyZXNzSW5kaWNlcyIsInN1YmFkZHJlc3NJbmRpY2VzIiwiZ2V0UmVsYXkiLCJyZWxheSIsInNldFJlbGF5IiwiZ2V0Q2FuU3BsaXQiLCJjYW5TcGxpdCIsInNldENhblNwbGl0IiwiZ2V0Tm90ZSIsIm5vdGUiLCJzZXROb3RlIiwiZ2V0UmVjaXBpZW50TmFtZSIsInJlY2lwaWVudE5hbWUiLCJzZXRSZWNpcGllbnROYW1lIiwic2V0QmVsb3dBbW91bnQiLCJnZXRTd2VlcEVhY2hTdWJhZGRyZXNzIiwic3dlZXBFYWNoU3ViYWRkcmVzcyIsInNldFN3ZWVwRWFjaFN1YmFkZHJlc3MiLCJnZXRLZXlJbWFnZSIsImtleUltYWdlIiwic2V0S2V5SW1hZ2UiLCJleHBvcnRzIiwiZGVmYXVsdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3RzL3dhbGxldC9tb2RlbC9Nb25lcm9UeENvbmZpZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXNzZXJ0IGZyb20gXCJhc3NlcnRcIjtcbmltcG9ydCBNb25lcm9EZXN0aW5hdGlvbiBmcm9tIFwiLi9Nb25lcm9EZXN0aW5hdGlvblwiO1xuaW1wb3J0IE1vbmVyb0Vycm9yIGZyb20gXCIuLi8uLi9jb21tb24vTW9uZXJvRXJyb3JcIjtcbmltcG9ydCBNb25lcm9UeFByaW9yaXR5IGZyb20gXCIuL01vbmVyb1R4UHJpb3JpdHlcIjtcblxuLyoqXG4gKiBDb25maWd1cmVzIGEgdHJhbnNhY3Rpb24gdG8gc2VuZCwgc3dlZXAsIG9yIGNyZWF0ZSBhIHBheW1lbnQgVVJJLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb25lcm9UeENvbmZpZyB7XG5cbiAgLyoqIFNpbmdsZSBkZXN0aW5hdGlvbiBhZGRyZXNzIChyZXF1aXJlZCB1bmxlc3MgYGRlc3RpbmF0aW9uc2AgcHJvdmlkZWQpLiAqL1xuICBhZGRyZXNzOiBzdHJpbmc7XG5cbiAgLyoqIFNpbmdsZSBkZXN0aW5hdGlvbiBhbW91bnQgKHJlcXVpcmVkIHVubGVzcyBgZGVzdGluYXRpb25zIHByb3ZpZGVkKS4gKi9cbiAgYW1vdW50OiBiaWdpbnQ7XG5cbiAgLyoqIFNvdXJjZSBhY2NvdW50IGluZGV4IHRvIHRyYW5zZmVyIGZ1bmRzIGZyb20gKHJlcXVpcmVkIHVubGVzcyBzd2VlcGluZyBrZXkgaW1hZ2UpLiAqL1xuICBhY2NvdW50SW5kZXg6IG51bWJlcjtcblxuICAvKiogU291cmNlIHN1YmFkZHJlc3MgaW5kZXggdG8gc2VuZCBmdW5kcyBmcm9tIChkZWZhdWx0IGFsbCkuICovXG4gIHN1YmFkZHJlc3NJbmRleDogbnVtYmVyO1xuXG4gIC8qKiBTb3VyY2Ugc3ViYWRkcmVzc2VzIHRvIHNlbmQgZnVuZHMgZnJvbSAoZGVmYXVsdCBhbGwpLiAqL1xuICBzdWJhZGRyZXNzSW5kaWNlczogbnVtYmVyW107XG5cbiAgLyoqIFJlbGF5IHRoZSB0cmFuc2FjdGlvbiB0byBwZWVycyB0byBjb21taXQgdG8gdGhlIGJsb2NrY2hhaW4gaWYgdHJ1ZSAoZGVmYXVsdCBmYWxzZSkuICovXG4gIHJlbGF5OiBib29sZWFuO1xuXG4gIC8qKiBUcmFuc2FjdGlvbiBwcmlvcml0eSB0byBhZGp1c3QgdGhlIG1pbmVyIGZlZSAoZGVmYXVsdCBNb25lcm9UeFByaW9yaXR5Lk5PUk1BTCkuICovXG4gIHByaW9yaXR5OiBNb25lcm9UeFByaW9yaXR5O1xuXG4gIC8qKiBNdWx0aXBsZSBkZXN0aW5hdGlvbnMgdG8gc2VuZCBmdW5kcyB0bywgaWYgYXBwbGljYWJsZS4gKi9cbiAgZGVzdGluYXRpb25zOiBQYXJ0aWFsPE1vbmVyb0Rlc3RpbmF0aW9uPltdO1xuXG4gIC8qKiBMaXN0IG9mIGRlc3RpbmF0aW9uIGluZGljZXMgdG8gc3BsaXQgdGhlIG1pbmVyIGZlZSAob3B0aW9uYWwpLiAqL1xuICBzdWJ0cmFjdEZlZUZyb206IG51bWJlcltdO1xuXG4gIC8qKiBQYXltZW50IElEIGZvciB0aGUgdHJhbnNhY3Rpb24uICovXG4gIHBheW1lbnRJZDogc3RyaW5nO1xuXG4gIC8qKiBNaW5lciBmZWUgKGNhbGN1bGF0ZWQgYXV0b21hdGljYWxseSkuICovXG4gIGZlZTogYmlnaW50O1xuXG4gIC8qKiBUcmFuc2FjdGlvbiBub3RlIHNhdmVkIGxvY2FsbHkgd2l0aCB0aGUgd2FsbGV0IChvcHRpb25hbCkuICovXG4gIG5vdGU6IHN0cmluZztcblxuICAvKiogUmVjaXBpZW50IG5hbWUgc2F2ZWQgbG9jYWxseSB3aXRoIHRoZSB3YWxsZXQgKG9wdGlvbmFsKS4gKi9cbiAgcmVjaXBpZW50TmFtZTogc3RyaW5nO1xuXG4gIC8qKiBBbGxvdyBmdW5kcyB0byBiZSB0cmFuc2ZlcnJlZCB1c2luZyBtdWx0aXBsZSB0cmFuc2FjdGlvbnMgaWYgbmVjZXNzYXJ5IChkZWZhdWx0IGZhbHNlKS4gKi9cbiAgY2FuU3BsaXQ6IGJvb2xlYW47XG5cbiAgLyoqIEZvciBzd2VlcCByZXF1ZXN0cywgaW5jbHVkZSBvdXRwdXRzIGJlbG93IHRoaXMgYW1vdW50IHdoZW4gc3dlZXBpbmcgd2FsbGV0LCBhY2NvdW50LCBzdWJhZGRyZXNzLCBvciBhbGwgdW5sb2NrZWQgZnVuZHMuICovXG4gIGJlbG93QW1vdW50OiBiaWdpbnQ7XG5cbiAgLyoqIEZvciBzd2VlcCByZXF1ZXN0cywgc3dlZXAgZWFjaCBzdWJhZGRyZXNzIGluZGl2aWR1YWxseSBpbnN0ZWFkIG9mIHRvZ2V0aGVyIGlmIHRydWUuICovXG4gIHN3ZWVwRWFjaFN1YmFkZHJlc3M6IGJvb2xlYW47XG5cbiAgLyoqIEZvciBzd2VlcCByZXF1ZXN0cywga2V5IGltYWdlIG9mIHRoZSBvdXRwdXQgdG8gc3dlZXAuICovXG4gIGtleUltYWdlOiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogPHA+R2VuZXJpYyByZXF1ZXN0IHRvIHRyYW5zZmVyIGZ1bmRzIGZyb20gYSB3YWxsZXQuPC9wPlxuICAgKiBcbiAgICogPHA+RXhhbXBsZTo8L3A+XG4gICAqIFxuICAgKiA8Y29kZT5cbiAgICogbGV0IGNvbmZpZzEgPSBuZXcgTW9uZXJvVHhDb25maWcoezxicj5cbiAgICogJm5ic3A7Jm5ic3A7IGFjY291bnRJbmRleDogMCw8YnI+XG4gICAqICZuYnNwOyZuYnNwOyBhZGRyZXNzOiBcIjU5YVpVTHNVRjNZTi4uLlwiLDxicj5cbiAgICogJm5ic3A7Jm5ic3A7IGFtb3VudDogNTAwMDAwbiw8YnI+XG4gICAqICZuYnNwOyZuYnNwOyBwcmlvcml0eTogTW9uZXJvVHhQcmlvcml0eS5OT1JNQUwsPGJyPlxuICAgKiAmbmJzcDsmbmJzcDsgcmVsYXk6IHRydWU8YnI+XG4gICAqIH0pO1xuICAgKiA8L2NvZGU+XG4gICAqIFxuICAgKiBAcGFyYW0ge1BhcnRpYWw8TW9uZXJvVHhDb25maWc+fSBbY29uZmlnXSAtIGNvbmZpZ3VyZXMgdGhlIHRyYW5zYWN0aW9uIHRvIGNyZWF0ZSAob3B0aW9uYWwpXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLmFkZHJlc3NdIC0gc2luZ2xlIGRlc3RpbmF0aW9uIGFkZHJlc3NcbiAgICogQHBhcmFtIHtiaWdpbnR9IFtjb25maWcuYW1vdW50XSAtIHNpbmdsZSBkZXN0aW5hdGlvbiBhbW91bnRcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtjb25maWcuYWNjb3VudEluZGV4XSAtIHNvdXJjZSBhY2NvdW50IGluZGV4IHRvIHRyYW5zZmVyIGZ1bmRzIGZyb21cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtjb25maWcuc3ViYWRkcmVzc0luZGV4XSAtIHNvdXJjZSBzdWJhZGRyZXNzIGluZGV4IHRvIHRyYW5zZmVyIGZ1bmRzIGZyb21cbiAgICogQHBhcmFtIHtudW1iZXJbXX0gW2NvbmZpZy5zdWJhZGRyZXNzSW5kaWNlc10gLSBzb3VyY2Ugc3ViYWRkcmVzcyBpbmRpY2VzIHRvIHRyYW5zZmVyIGZ1bmRzIGZyb21cbiAgICogQHBhcmFtIHtib29sZWFufSBbY29uZmlnLnJlbGF5XSAtIHJlbGF5IHRoZSB0cmFuc2FjdGlvbiB0byBwZWVycyB0byBjb21taXQgdG8gdGhlIGJsb2NrY2hhaW5cbiAgICogQHBhcmFtIHtNb25lcm9UeFByaW9yaXR5fSBbY29uZmlnLnByaW9yaXR5XSAtIHRyYW5zYWN0aW9uIHByaW9yaXR5IChkZWZhdWx0IE1vbmVyb1R4UHJpb3JpdHkuTk9STUFMKVxuICAgKiBAcGFyYW0ge01vbmVyb0Rlc3RpbmF0aW9uW119IFtjb25maWcuZGVzdGluYXRpb25zXSAtIGFkZHJlc3NlcyBhbmQgYW1vdW50cyBpbiBhIG11bHRpLWRlc3RpbmF0aW9uIHR4XG4gICAqIEBwYXJhbSB7bnVtYmVyW119IFtjb25maWcuc3VidHJhY3RGZWVGcm9tXSAtIGxpc3Qgb2YgZGVzdGluYXRpb24gaW5kaWNlcyB0byBzcGxpdCB0aGUgdHJhbnNhY3Rpb24gZmVlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLnBheW1lbnRJZF0gLSB0cmFuc2FjdGlvbiBwYXltZW50IElEXG4gICAqIEBwYXJhbSB7YmlnaW50fSBbY29uZmlnLnVubG9ja1RpbWVdIC0gbWluaW11bSBoZWlnaHQgb3IgdGltZXN0YW1wIGZvciB0aGUgdHJhbnNhY3Rpb24gdG8gdW5sb2NrIChkZWZhdWx0IDApXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLm5vdGVdIC0gdHJhbnNhY3Rpb24gbm90ZSBzYXZlZCBsb2NhbGx5IHdpdGggdGhlIHdhbGxldFxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5yZWNpcGllbnROYW1lXSAtIHJlY2lwaWVudCBuYW1lIHNhdmVkIGxvY2FsbHkgd2l0aCB0aGUgd2FsbGV0XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NvbmZpZy5jYW5TcGxpdF0gLSBhbGxvdyBmdW5kcyB0byBiZSB0cmFuc2ZlcnJlZCB1c2luZyBtdWx0aXBsZSB0cmFuc2FjdGlvbnNcbiAgICogQHBhcmFtIHtiaWdpbnR9IFtjb25maWcuYmVsb3dBbW91bnRdIC0gZm9yIHN3ZWVwIHJlcXVlc3RzLCBpbmNsdWRlIG91dHB1dHMgYmVsb3cgdGhpcyBhbW91bnQgd2hlbiBzd2VlcGluZyB3YWxsZXQsIGFjY291bnQsIHN1YmFkZHJlc3MsIG9yIGFsbCB1bmxvY2tlZCBmdW5kcyBcbiAgICogQHBhcmFtIHtib29sZWFufSBbY29uZmlnLnN3ZWVwRWFjaFN1YmFkZHJlc3NdIC0gZm9yIHN3ZWVwIHJlcXVlc3RzLCBzd2VlcCBlYWNoIHN1YmFkZHJlc3MgaW5kaXZpZHVhbGx5IGluc3RlYWQgb2YgdG9nZXRoZXIgaWYgdHJ1ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5rZXlJbWFnZV0gLSBrZXkgaW1hZ2UgdG8gc3dlZXAgKGlnbm9yZWQgZXhjZXB0IGluIHN3ZWVwT3V0cHV0KCkgcmVxdWVzdHMpXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBQYXJ0aWFsPE1vbmVyb1R4Q29uZmlnPikge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcywgY29uZmlnKTtcblxuICAgIC8vIGRlc2VyaWFsaXplIGJpZ2ludHNcbiAgICBpZiAodGhpcy5hbW91bnQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdGhpcy5hbW91bnQgIT09IFwiYmlnaW50XCIpIHRoaXMuYW1vdW50ID0gQmlnSW50KHRoaXMuYW1vdW50KTtcbiAgICBpZiAodGhpcy5mZWUgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdGhpcy5mZWUgIT09IFwiYmlnaW50XCIpIHRoaXMuZmVlID0gQmlnSW50KHRoaXMuZmVlKTtcbiAgICBpZiAodGhpcy5iZWxvd0Ftb3VudCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB0aGlzLmJlbG93QW1vdW50ICE9PSBcImJpZ2ludFwiKSB0aGlzLmJlbG93QW1vdW50ID0gQmlnSW50KHRoaXMuYmVsb3dBbW91bnQpO1xuXG4gICAgLy8gY29weSBkZXN0aW5hdGlvbnNcbiAgICBpZiAodGhpcy5kZXN0aW5hdGlvbnMpIHtcbiAgICAgIGFzc2VydCh0aGlzLmFkZHJlc3MgPT09IHVuZGVmaW5lZCAmJiB0aGlzLmFtb3VudCA9PT0gdW5kZWZpbmVkLCBcIlR4IGNvbmZpZ3VyYXRpb24gbWF5IHNwZWNpZnkgZGVzdGluYXRpb25zIG9yIGFuIGFkZHJlc3MvYW1vdW50IGJ1dCBub3QgYm90aFwiKTtcbiAgICAgIHRoaXMuc2V0RGVzdGluYXRpb25zKHRoaXMuZGVzdGluYXRpb25zLm1hcChkZXN0aW5hdGlvbiA9PiBuZXcgTW9uZXJvRGVzdGluYXRpb24oZGVzdGluYXRpb24pKSk7XG4gICAgfVxuICAgIFxuICAgIC8vIGFsaWFzICdhZGRyZXNzJyBhbmQgJ2Ftb3VudCcgdG8gc2luZ2xlIGRlc3RpbmF0aW9uIHRvIHN1cHBvcnQgZS5nLiBjcmVhdGVUeCh7YWRkcmVzczogXCIuLi5cIn0pXG4gICAgaWYgKHRoaXMuYWRkcmVzcyB8fCB0aGlzLmFtb3VudCkge1xuICAgICAgYXNzZXJ0KCF0aGlzLmRlc3RpbmF0aW9ucywgXCJUeCBjb25maWd1cmF0aW9uIG1heSBzcGVjaWZ5IGRlc3RpbmF0aW9ucyBvciBhbiBhZGRyZXNzL2Ftb3VudCBidXQgbm90IGJvdGhcIik7XG4gICAgICB0aGlzLnNldEFkZHJlc3ModGhpcy5hZGRyZXNzKTtcbiAgICAgIHRoaXMuc2V0QW1vdW50KHRoaXMuYW1vdW50KTtcbiAgICAgIGRlbGV0ZSB0aGlzLmFkZHJlc3M7XG4gICAgICBkZWxldGUgdGhpcy5hbW91bnQ7XG4gICAgfVxuICAgIFxuICAgIC8vIGFsaWFzICdzdWJhZGRyZXNzSW5kZXgnIHRvIHN1YmFkZHJlc3MgaW5kaWNlc1xuICAgIGlmICh0aGlzLnN1YmFkZHJlc3NJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNldFN1YmFkZHJlc3NJbmRpY2VzKFt0aGlzLnN1YmFkZHJlc3NJbmRleF0pO1xuICAgICAgZGVsZXRlIHRoaXMuc3ViYWRkcmVzc0luZGV4O1xuICAgIH1cbiAgfVxuICBcbiAgY29weSgpOiBNb25lcm9UeENvbmZpZyB7XG4gICAgcmV0dXJuIG5ldyBNb25lcm9UeENvbmZpZyh0aGlzKTtcbiAgfVxuICBcbiAgdG9Kc29uKCk6IGFueSB7XG4gICAgbGV0IGpzb246IGFueSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMpOyAvLyBjb3B5IHN0YXRlXG4gICAgaWYgKHRoaXMuZ2V0RGVzdGluYXRpb25zKCkgIT09IHVuZGVmaW5lZCkge1xuICAgICAganNvbi5kZXN0aW5hdGlvbnMgPSBbXTtcbiAgICAgIGZvciAobGV0IGRlc3RpbmF0aW9uIG9mIHRoaXMuZ2V0RGVzdGluYXRpb25zKCkpIGpzb24uZGVzdGluYXRpb25zLnB1c2goZGVzdGluYXRpb24udG9Kc29uKCkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5nZXRGZWUoKSkganNvbi5mZWUgPSB0aGlzLmdldEZlZSgpLnRvU3RyaW5nKCk7XG4gICAgaWYgKHRoaXMuZ2V0QmVsb3dBbW91bnQoKSkganNvbi5iZWxvd0Ftb3VudCA9IHRoaXMuZ2V0QmVsb3dBbW91bnQoKS50b1N0cmluZygpO1xuICAgIHJldHVybiBqc29uO1xuICB9XG4gIFxuICAvKipcbiAgICogU2V0IHRoZSBhZGRyZXNzIG9mIGEgc2luZ2xlLWRlc3RpbmF0aW9uIGNvbmZpZ3VyYXRpb24uXG4gICAqIFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWRkcmVzcyAtIHRoZSBhZGRyZXNzIHRvIHNldCBmb3IgdGhlIHNpbmdsZSBkZXN0aW5hdGlvblxuICAgKiBAcmV0dXJuIHtNb25lcm9UeENvbmZpZ30gdGhpcyBjb25maWd1cmF0aW9uIGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0QWRkcmVzcyhhZGRyZXNzOiBzdHJpbmcpOiBNb25lcm9UeENvbmZpZyB7XG4gICAgaWYgKHRoaXMuZGVzdGluYXRpb25zICE9PSB1bmRlZmluZWQgJiYgdGhpcy5kZXN0aW5hdGlvbnMubGVuZ3RoID4gMSkgdGhyb3cgbmV3IE1vbmVyb0Vycm9yKFwiQ2Fubm90IHNldCBhZGRyZXNzIGJlY2F1c2UgTW9uZXJvVHhDb25maWcgYWxyZWFkeSBoYXMgbXVsdGlwbGUgZGVzdGluYXRpb25zXCIpO1xuICAgIGlmICh0aGlzLmRlc3RpbmF0aW9ucyA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuZGVzdGluYXRpb25zLmxlbmd0aCA9PT0gMCkgdGhpcy5hZGREZXN0aW5hdGlvbihuZXcgTW9uZXJvRGVzdGluYXRpb24oYWRkcmVzcykpO1xuICAgIGVsc2UgKHRoaXMuZGVzdGluYXRpb25zWzBdIGFzIE1vbmVyb0Rlc3RpbmF0aW9uKS5zZXRBZGRyZXNzKGFkZHJlc3MpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogR2V0IHRoZSBhZGRyZXNzIG9mIGEgc2luZ2xlLWRlc3RpbmF0aW9uIGNvbmZpZ3VyYXRpb24uXG4gICAqIFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBhZGRyZXNzIG9mIHRoZSBzaW5nbGUgZGVzdGluYXRpb25cbiAgICovXG4gIGdldEFkZHJlc3MoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5kZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmRlc3RpbmF0aW9ucy5sZW5ndGggIT09IDEpIHRocm93IG5ldyBNb25lcm9FcnJvcihcIkNhbm5vdCBnZXQgYWRkcmVzcyBiZWNhdXNlIE1vbmVyb1R4Q29uZmlnIGRvZXMgbm90IGhhdmUgZXhhY3RseSBvbmUgZGVzdGluYXRpb25cIik7XG4gICAgcmV0dXJuICh0aGlzLmRlc3RpbmF0aW9uc1swXSBhcyBNb25lcm9EZXN0aW5hdGlvbikuZ2V0QWRkcmVzcygpO1xuICB9XG4gIFxuICAvKipcbiAgICogU2V0IHRoZSBhbW91bnQgb2YgYSBzaW5nbGUtZGVzdGluYXRpb24gY29uZmlndXJhdGlvbi5cbiAgICogXG4gICAqIEBwYXJhbSB7YmlnaW50fSBhbW91bnQgLSB0aGUgYW1vdW50IHRvIHNldCBmb3IgdGhlIHNpbmdsZSBkZXN0aW5hdGlvblxuICAgKiBAcmV0dXJuIHtNb25lcm9UeENvbmZpZ30gdGhpcyBjb25maWd1cmF0aW9uIGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0QW1vdW50KGFtb3VudDogYmlnaW50KTogTW9uZXJvVHhDb25maWcge1xuICAgIGlmIChhbW91bnQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdGhpcy5hbW91bnQgIT09IFwiYmlnaW50XCIpIHtcbiAgICAgIGlmICh0eXBlb2YgYW1vdW50ID09PSBcIm51bWJlclwiKSB0aHJvdyBuZXcgTW9uZXJvRXJyb3IoXCJEZXN0aW5hdGlvbiBhbW91bnQgbXVzdCBiZSBiaWdpbnQgb3Igc3RyaW5nXCIpO1xuICAgICAgdHJ5IHsgYW1vdW50ID0gQmlnSW50KGFtb3VudCk7IH1cbiAgICAgIGNhdGNoIChlcnIpIHsgdGhyb3cgbmV3IE1vbmVyb0Vycm9yKFwiSW52YWxpZCBkZXN0aW5hdGlvbiBhbW91bnQ6IFwiICsgYW1vdW50KTsgfVxuICAgIH1cbiAgICBpZiAodGhpcy5kZXN0aW5hdGlvbnMgIT09IHVuZGVmaW5lZCAmJiB0aGlzLmRlc3RpbmF0aW9ucy5sZW5ndGggPiAxKSB0aHJvdyBuZXcgTW9uZXJvRXJyb3IoXCJDYW5ub3Qgc2V0IGFtb3VudCBiZWNhdXNlIE1vbmVyb1R4Q29uZmlnIGFscmVhZHkgaGFzIG11bHRpcGxlIGRlc3RpbmF0aW9uc1wiKTtcbiAgICBpZiAodGhpcy5kZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmRlc3RpbmF0aW9ucy5sZW5ndGggPT09IDApIHRoaXMuYWRkRGVzdGluYXRpb24obmV3IE1vbmVyb0Rlc3RpbmF0aW9uKHVuZGVmaW5lZCwgYW1vdW50KSk7XG4gICAgZWxzZSAodGhpcy5kZXN0aW5hdGlvbnNbMF0gYXMgTW9uZXJvRGVzdGluYXRpb24pLnNldEFtb3VudChhbW91bnQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogR2V0IHRoZSBhbW91bnQgb2YgYSBzaW5nbGUtZGVzdGluYXRpb24gY29uZmlndXJhdGlvbi5cbiAgICogXG4gICAqIEByZXR1cm4ge2JpZ2ludH0gdGhlIGFtb3VudCBvZiB0aGUgc2luZ2xlIGRlc3RpbmF0aW9uXG4gICAqL1xuICBnZXRBbW91bnQoKTogYmlnaW50IHtcbiAgICBpZiAodGhpcy5kZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmRlc3RpbmF0aW9ucy5sZW5ndGggIT09IDEpIHRocm93IG5ldyBNb25lcm9FcnJvcihcIkNhbm5vdCBnZXQgYW1vdW50IGJlY2F1c2UgTW9uZXJvVHhDb25maWcgZG9lcyBub3QgaGF2ZSBleGFjdGx5IG9uZSBkZXN0aW5hdGlvblwiKTtcbiAgICByZXR1cm4gKHRoaXMuZGVzdGluYXRpb25zWzBdIGFzIE1vbmVyb0Rlc3RpbmF0aW9uKS5nZXRBbW91bnQoKTtcbiAgfVxuICBcbiAgYWRkRGVzdGluYXRpb24oZGVzdGluYXRpb25PckFkZHJlc3M6IE1vbmVyb0Rlc3RpbmF0aW9uIHwgc3RyaW5nLCBhbW91bnQ/OiBiaWdpbnQpOiBNb25lcm9UeENvbmZpZyB7XG4gICAgaWYgKHR5cGVvZiBkZXN0aW5hdGlvbk9yQWRkcmVzcyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHRoaXMuYWRkRGVzdGluYXRpb24obmV3IE1vbmVyb0Rlc3RpbmF0aW9uKGRlc3RpbmF0aW9uT3JBZGRyZXNzLCBhbW91bnQpKTtcbiAgICBhc3NlcnQoZGVzdGluYXRpb25PckFkZHJlc3MgaW5zdGFuY2VvZiBNb25lcm9EZXN0aW5hdGlvbik7XG4gICAgaWYgKHRoaXMuZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHRoaXMuZGVzdGluYXRpb25zID0gW107XG4gICAgdGhpcy5kZXN0aW5hdGlvbnMucHVzaChkZXN0aW5hdGlvbk9yQWRkcmVzcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIGdldERlc3RpbmF0aW9ucygpOiBNb25lcm9EZXN0aW5hdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5kZXN0aW5hdGlvbnMgYXMgTW9uZXJvRGVzdGluYXRpb25bXTtcbiAgfVxuICBcbiAgc2V0RGVzdGluYXRpb25zKGRlc3RpbmF0aW9uczogTW9uZXJvRGVzdGluYXRpb25bXSk6IE1vbmVyb1R4Q29uZmlnIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIGRlc3RpbmF0aW9ucyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcbiAgICB0aGlzLmRlc3RpbmF0aW9ucyA9IGRlc3RpbmF0aW9ucztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgc2V0RGVzdGluYXRpb24oZGVzdGluYXRpb246IE1vbmVyb0Rlc3RpbmF0aW9uKTogTW9uZXJvVHhDb25maWcge1xuICAgIHJldHVybiB0aGlzLnNldERlc3RpbmF0aW9ucyhkZXN0aW5hdGlvbiA/IFtkZXN0aW5hdGlvbl0gOiB1bmRlZmluZWQpO1xuICB9XG5cbiAgZ2V0U3VidHJhY3RGZWVGcm9tKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5zdWJ0cmFjdEZlZUZyb207XG4gIH1cblxuICBzZXRTdWJ0cmFjdEZlZUZyb20oZGVzdGluYXRpb25JbmRpY2VzOiBudW1iZXJbXSk6IE1vbmVyb1R4Q29uZmlnIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIGRlc3RpbmF0aW9uSW5kaWNlcyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcbiAgICB0aGlzLnN1YnRyYWN0RmVlRnJvbSA9IGRlc3RpbmF0aW9uSW5kaWNlcztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgZ2V0UGF5bWVudElkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucGF5bWVudElkO1xuICB9XG4gIFxuICBzZXRQYXltZW50SWQocGF5bWVudElkOiBzdHJpbmcpOiBNb25lcm9UeENvbmZpZyB7XG4gICAgdGhpcy5wYXltZW50SWQgPSBwYXltZW50SWQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIGdldFByaW9yaXR5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHk7XG4gIH1cbiAgXG4gIHNldFByaW9yaXR5KHByaW9yaXR5OiBudW1iZXIpOiBNb25lcm9UeENvbmZpZyB7XG4gICAgdGhpcy5wcmlvcml0eSA9IHByaW9yaXR5O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXRGZWUoKTogYmlnaW50IHtcbiAgICByZXR1cm4gdGhpcy5mZWU7XG4gIH1cbiAgXG4gIHNldEZlZShmZWU6IGJpZ2ludCk6IE1vbmVyb1R4Q29uZmlnIHtcbiAgICB0aGlzLmZlZSA9IGZlZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgZ2V0QWNjb3VudEluZGV4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYWNjb3VudEluZGV4O1xuICB9XG4gIFxuICBzZXRBY2NvdW50SW5kZXgoYWNjb3VudEluZGV4OiBudW1iZXIpOiBNb25lcm9UeENvbmZpZyB7XG4gICAgdGhpcy5hY2NvdW50SW5kZXggPSBhY2NvdW50SW5kZXg7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIHNldFN1YmFkZHJlc3NJbmRleChzdWJhZGRyZXNzSW5kZXg6IG51bWJlcik6IE1vbmVyb1R4Q29uZmlnIHtcbiAgICB0aGlzLnNldFN1YmFkZHJlc3NJbmRpY2VzKFtzdWJhZGRyZXNzSW5kZXhdKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgZ2V0U3ViYWRkcmVzc0luZGljZXMoKTogbnVtYmVyW10ge1xuICAgIHJldHVybiB0aGlzLnN1YmFkZHJlc3NJbmRpY2VzO1xuICB9XG4gIFxuICBzZXRTdWJhZGRyZXNzSW5kaWNlcyhzdWJhZGRyZXNzSW5kaWNlczogbnVtYmVyW10pOiBNb25lcm9UeENvbmZpZyB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSBzdWJhZGRyZXNzSW5kaWNlcyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcbiAgICB0aGlzLnN1YmFkZHJlc3NJbmRpY2VzID0gc3ViYWRkcmVzc0luZGljZXM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIGdldFJlbGF5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlbGF5O1xuICB9XG4gIFxuICBzZXRSZWxheShyZWxheTogYm9vbGVhbik6IE1vbmVyb1R4Q29uZmlnIHtcbiAgICB0aGlzLnJlbGF5ID0gcmVsYXk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIGdldENhblNwbGl0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNhblNwbGl0O1xuICB9XG4gIFxuICBzZXRDYW5TcGxpdChjYW5TcGxpdDogYm9vbGVhbik6IE1vbmVyb1R4Q29uZmlnIHtcbiAgICB0aGlzLmNhblNwbGl0ID0gY2FuU3BsaXQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIGdldE5vdGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5ub3RlO1xuICB9XG4gIFxuICBzZXROb3RlKG5vdGU6IHN0cmluZyk6IE1vbmVyb1R4Q29uZmlnIHtcbiAgICB0aGlzLm5vdGUgPSBub3RlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXRSZWNpcGllbnROYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucmVjaXBpZW50TmFtZTtcbiAgfVxuICBcbiAgc2V0UmVjaXBpZW50TmFtZShyZWNpcGllbnROYW1lOiBzdHJpbmcpOiBNb25lcm9UeENvbmZpZyB7XG4gICAgdGhpcy5yZWNpcGllbnROYW1lID0gcmVjaXBpZW50TmFtZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFNQRUNJRklDIFRPIFNXRUVQIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgXG4gIGdldEJlbG93QW1vdW50KCkge1xuICAgIHJldHVybiB0aGlzLmJlbG93QW1vdW50O1xuICB9XG4gIFxuICBzZXRCZWxvd0Ftb3VudChiZWxvd0Ftb3VudCkge1xuICAgIHRoaXMuYmVsb3dBbW91bnQgPSBiZWxvd0Ftb3VudDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgZ2V0U3dlZXBFYWNoU3ViYWRkcmVzcygpIHtcbiAgICByZXR1cm4gdGhpcy5zd2VlcEVhY2hTdWJhZGRyZXNzO1xuICB9XG4gIFxuICBzZXRTd2VlcEVhY2hTdWJhZGRyZXNzKHN3ZWVwRWFjaFN1YmFkZHJlc3MpIHtcbiAgICB0aGlzLnN3ZWVwRWFjaFN1YmFkZHJlc3MgPSBzd2VlcEVhY2hTdWJhZGRyZXNzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogR2V0IHRoZSBrZXkgaW1hZ2UgaGV4IG9mIHRoZSBvdXRwdXQgdG8gc3dlZXAuXG4gICAqIFxuICAgKiByZXR1cm4ge3N0cmluZ30gaXMgdGhlIGtleSBpbWFnZSBoZXggb2YgdGhlIG91dHB1dCB0byBzd2VlcFxuICAgKi9cbiAgZ2V0S2V5SW1hZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMua2V5SW1hZ2U7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBTZXQgdGhlIGtleSBpbWFnZSBoZXggb2YgdGhlIG91dHB1dCB0byBzd2VlcC5cbiAgICogXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlJbWFnZSBpcyB0aGUga2V5IGltYWdlIGhleCBvZiB0aGUgb3V0cHV0IHRvIHN3ZWVwXG4gICAqL1xuICBzZXRLZXlJbWFnZShrZXlJbWFnZSkge1xuICAgIHRoaXMua2V5SW1hZ2UgPSBrZXlJbWFnZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoieUxBQUEsSUFBQUEsT0FBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBO0FBQ0EsSUFBQUMsa0JBQUEsR0FBQUYsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFFLFlBQUEsR0FBQUgsc0JBQUEsQ0FBQUMsT0FBQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUcsY0FBYyxDQUFDOztFQUVsQzs7O0VBR0E7OztFQUdBOzs7RUFHQTs7O0VBR0E7OztFQUdBOzs7RUFHQTs7O0VBR0E7OztFQUdBOzs7RUFHQTs7O0VBR0E7OztFQUdBOzs7RUFHQTs7O0VBR0E7OztFQUdBOzs7RUFHQTs7O0VBR0E7OztFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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