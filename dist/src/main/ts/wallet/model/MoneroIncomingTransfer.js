"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _assert = _interopRequireDefault(require("assert"));
var _GenUtils = _interopRequireDefault(require("../../common/GenUtils"));
var _MoneroTransfer = _interopRequireDefault(require("./MoneroTransfer"));


/**
 * Models an incoming transfer of funds to the wallet.
 */
class MoneroIncomingTransfer extends _MoneroTransfer.default {





  /**
   * Construct the transfer.
   * 
   * @param {MoneroTransfer} [transfer] is existing state to initialize from (optional)
   */
  constructor(transfer) {
    super(transfer);
  }

  getIsIncoming() {
    return true;
  }

  getSubaddressIndex() {
    return this.subaddressIndex;
  }

  setSubaddressIndex(subaddressIndex) {
    this.subaddressIndex = subaddressIndex;
    return this;
  }

  getAddress() {
    return this.address;
  }

  setAddress(address) {
    this.address = address;
    return this;
  }

  /**
   * Return how many confirmations till it's not economically worth re-writing the chain.
   * That is, the number of confirmations before the transaction is highly unlikely to be
   * double spent or overwritten and may be considered settled, e.g. for a merchant to trust
   * as finalized.
   * 
   * @return {number} is the number of confirmations before it's not worth rewriting the chain
   */
  getNumSuggestedConfirmations() {
    return this.numSuggestedConfirmations;
  }

  setNumSuggestedConfirmations(numSuggestedConfirmations) {
    this.numSuggestedConfirmations = numSuggestedConfirmations;
    return this;
  }

  copy() {
    return new MoneroIncomingTransfer(this.toJson());
  }

  /**
   * Updates this transaction by merging the latest information from the given
   * transaction.
   * 
   * Merging can modify or build references to the transfer given so it
   * should not be re-used or it should be copied before calling this method.
   * 
   * @param {MoneroIncomingTransfer} transfer is the transfer to merge into this one
   * @return {MoneroIncomingTransfer}
   */
  merge(transfer) {
    super.merge(transfer);
    (0, _assert.default)(transfer instanceof MoneroIncomingTransfer);
    if (this === transfer) return this;
    this.setSubaddressIndex(_GenUtils.default.reconcile(this.getSubaddressIndex(), transfer.getSubaddressIndex()));
    this.setAddress(_GenUtils.default.reconcile(this.getAddress(), transfer.getAddress()));
    this.setNumSuggestedConfirmations(_GenUtils.default.reconcile(this.getNumSuggestedConfirmations(), transfer.getNumSuggestedConfirmations(), { resolveMax: false }));
    return this;
  }

  toString(indent = 0) {
    let str = super.toString(indent) + "\n";
    str += _GenUtils.default.kvLine("Subaddress index", this.getSubaddressIndex(), indent);
    str += _GenUtils.default.kvLine("Address", this.getAddress(), indent);
    str += _GenUtils.default.kvLine("Num suggested confirmations", this.getNumSuggestedConfirmations(), indent);
    return str.slice(0, str.length - 1); // strip last newline
  }

  // -------------------- OVERRIDE COVARIANT RETURN TYPES ---------------------

  setTx(tx) {
    super.setTx(tx);
    return this;
  }

  setAmount(amount) {
    super.setAmount(amount);
    return this;
  }

  setAccountIndex(accountIndex) {
    super.setAccountIndex(accountIndex);
    return this;
  }
}exports.default = MoneroIncomingTransfer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfYXNzZXJ0IiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJfR2VuVXRpbHMiLCJfTW9uZXJvVHJhbnNmZXIiLCJNb25lcm9JbmNvbWluZ1RyYW5zZmVyIiwiTW9uZXJvVHJhbnNmZXIiLCJjb25zdHJ1Y3RvciIsInRyYW5zZmVyIiwiZ2V0SXNJbmNvbWluZyIsImdldFN1YmFkZHJlc3NJbmRleCIsInN1YmFkZHJlc3NJbmRleCIsInNldFN1YmFkZHJlc3NJbmRleCIsImdldEFkZHJlc3MiLCJhZGRyZXNzIiwic2V0QWRkcmVzcyIsImdldE51bVN1Z2dlc3RlZENvbmZpcm1hdGlvbnMiLCJudW1TdWdnZXN0ZWRDb25maXJtYXRpb25zIiwic2V0TnVtU3VnZ2VzdGVkQ29uZmlybWF0aW9ucyIsImNvcHkiLCJ0b0pzb24iLCJtZXJnZSIsImFzc2VydCIsIkdlblV0aWxzIiwicmVjb25jaWxlIiwicmVzb2x2ZU1heCIsInRvU3RyaW5nIiwiaW5kZW50Iiwic3RyIiwia3ZMaW5lIiwic2xpY2UiLCJsZW5ndGgiLCJzZXRUeCIsInR4Iiwic2V0QW1vdW50IiwiYW1vdW50Iiwic2V0QWNjb3VudEluZGV4IiwiYWNjb3VudEluZGV4IiwiZXhwb3J0cyIsImRlZmF1bHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi90cy93YWxsZXQvbW9kZWwvTW9uZXJvSW5jb21pbmdUcmFuc2Zlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXNzZXJ0IGZyb20gXCJhc3NlcnRcIjtcbmltcG9ydCBHZW5VdGlscyBmcm9tIFwiLi4vLi4vY29tbW9uL0dlblV0aWxzXCI7XG5pbXBvcnQgTW9uZXJvVHJhbnNmZXIgZnJvbSBcIi4vTW9uZXJvVHJhbnNmZXJcIjtcbmltcG9ydCBNb25lcm9UeFdhbGxldCBmcm9tIFwiLi9Nb25lcm9UeFdhbGxldFwiO1xuXG4vKipcbiAqIE1vZGVscyBhbiBpbmNvbWluZyB0cmFuc2ZlciBvZiBmdW5kcyB0byB0aGUgd2FsbGV0LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb25lcm9JbmNvbWluZ1RyYW5zZmVyIGV4dGVuZHMgTW9uZXJvVHJhbnNmZXIge1xuXG4gIHN1YmFkZHJlc3NJbmRleDogbnVtYmVyO1xuICBhZGRyZXNzOiBzdHJpbmc7XG4gIG51bVN1Z2dlc3RlZENvbmZpcm1hdGlvbnM6IG51bWJlcjtcbiAgXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgdGhlIHRyYW5zZmVyLlxuICAgKiBcbiAgICogQHBhcmFtIHtNb25lcm9UcmFuc2Zlcn0gW3RyYW5zZmVyXSBpcyBleGlzdGluZyBzdGF0ZSB0byBpbml0aWFsaXplIGZyb20gKG9wdGlvbmFsKVxuICAgKi9cbiAgY29uc3RydWN0b3IodHJhbnNmZXI/OiBQYXJ0aWFsPE1vbmVyb0luY29taW5nVHJhbnNmZXI+KSB7XG4gICAgc3VwZXIodHJhbnNmZXIpO1xuICB9XG4gIFxuICBnZXRJc0luY29taW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIFxuICBnZXRTdWJhZGRyZXNzSW5kZXgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5zdWJhZGRyZXNzSW5kZXg7XG4gIH1cbiAgXG4gIHNldFN1YmFkZHJlc3NJbmRleChzdWJhZGRyZXNzSW5kZXg6IG51bWJlcik6IE1vbmVyb0luY29taW5nVHJhbnNmZXIge1xuICAgIHRoaXMuc3ViYWRkcmVzc0luZGV4ID0gc3ViYWRkcmVzc0luZGV4O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXRBZGRyZXNzKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuYWRkcmVzcztcbiAgfVxuXG4gIHNldEFkZHJlc3MoYWRkcmVzczogc3RyaW5nKTogTW9uZXJvSW5jb21pbmdUcmFuc2ZlciB7XG4gICAgdGhpcy5hZGRyZXNzID0gYWRkcmVzcztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLyoqXG4gICAqIFJldHVybiBob3cgbWFueSBjb25maXJtYXRpb25zIHRpbGwgaXQncyBub3QgZWNvbm9taWNhbGx5IHdvcnRoIHJlLXdyaXRpbmcgdGhlIGNoYWluLlxuICAgKiBUaGF0IGlzLCB0aGUgbnVtYmVyIG9mIGNvbmZpcm1hdGlvbnMgYmVmb3JlIHRoZSB0cmFuc2FjdGlvbiBpcyBoaWdobHkgdW5saWtlbHkgdG8gYmVcbiAgICogZG91YmxlIHNwZW50IG9yIG92ZXJ3cml0dGVuIGFuZCBtYXkgYmUgY29uc2lkZXJlZCBzZXR0bGVkLCBlLmcuIGZvciBhIG1lcmNoYW50IHRvIHRydXN0XG4gICAqIGFzIGZpbmFsaXplZC5cbiAgICogXG4gICAqIEByZXR1cm4ge251bWJlcn0gaXMgdGhlIG51bWJlciBvZiBjb25maXJtYXRpb25zIGJlZm9yZSBpdCdzIG5vdCB3b3J0aCByZXdyaXRpbmcgdGhlIGNoYWluXG4gICAqL1xuICBnZXROdW1TdWdnZXN0ZWRDb25maXJtYXRpb25zKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubnVtU3VnZ2VzdGVkQ29uZmlybWF0aW9ucztcbiAgfVxuICBcbiAgc2V0TnVtU3VnZ2VzdGVkQ29uZmlybWF0aW9ucyhudW1TdWdnZXN0ZWRDb25maXJtYXRpb25zOiBudW1iZXIpOiBNb25lcm9JbmNvbWluZ1RyYW5zZmVyIHtcbiAgICB0aGlzLm51bVN1Z2dlc3RlZENvbmZpcm1hdGlvbnMgPSBudW1TdWdnZXN0ZWRDb25maXJtYXRpb25zO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY29weSgpOiBNb25lcm9JbmNvbWluZ1RyYW5zZmVyIHtcbiAgICByZXR1cm4gbmV3IE1vbmVyb0luY29taW5nVHJhbnNmZXIodGhpcy50b0pzb24oKSk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoaXMgdHJhbnNhY3Rpb24gYnkgbWVyZ2luZyB0aGUgbGF0ZXN0IGluZm9ybWF0aW9uIGZyb20gdGhlIGdpdmVuXG4gICAqIHRyYW5zYWN0aW9uLlxuICAgKiBcbiAgICogTWVyZ2luZyBjYW4gbW9kaWZ5IG9yIGJ1aWxkIHJlZmVyZW5jZXMgdG8gdGhlIHRyYW5zZmVyIGdpdmVuIHNvIGl0XG4gICAqIHNob3VsZCBub3QgYmUgcmUtdXNlZCBvciBpdCBzaG91bGQgYmUgY29waWVkIGJlZm9yZSBjYWxsaW5nIHRoaXMgbWV0aG9kLlxuICAgKiBcbiAgICogQHBhcmFtIHtNb25lcm9JbmNvbWluZ1RyYW5zZmVyfSB0cmFuc2ZlciBpcyB0aGUgdHJhbnNmZXIgdG8gbWVyZ2UgaW50byB0aGlzIG9uZVxuICAgKiBAcmV0dXJuIHtNb25lcm9JbmNvbWluZ1RyYW5zZmVyfVxuICAgKi9cbiAgbWVyZ2UodHJhbnNmZXI6IE1vbmVyb0luY29taW5nVHJhbnNmZXIpOiBNb25lcm9JbmNvbWluZ1RyYW5zZmVyIHtcbiAgICBzdXBlci5tZXJnZSh0cmFuc2Zlcik7XG4gICAgYXNzZXJ0KHRyYW5zZmVyIGluc3RhbmNlb2YgTW9uZXJvSW5jb21pbmdUcmFuc2Zlcik7XG4gICAgaWYgKHRoaXMgPT09IHRyYW5zZmVyKSByZXR1cm4gdGhpcztcbiAgICB0aGlzLnNldFN1YmFkZHJlc3NJbmRleChHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRTdWJhZGRyZXNzSW5kZXgoKSwgdHJhbnNmZXIuZ2V0U3ViYWRkcmVzc0luZGV4KCkpKTtcbiAgICB0aGlzLnNldEFkZHJlc3MoR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0QWRkcmVzcygpLCB0cmFuc2Zlci5nZXRBZGRyZXNzKCkpKTtcbiAgICB0aGlzLnNldE51bVN1Z2dlc3RlZENvbmZpcm1hdGlvbnMoR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0TnVtU3VnZ2VzdGVkQ29uZmlybWF0aW9ucygpLCB0cmFuc2Zlci5nZXROdW1TdWdnZXN0ZWRDb25maXJtYXRpb25zKCksIHtyZXNvbHZlTWF4OiBmYWxzZX0pKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgdG9TdHJpbmcoaW5kZW50ID0gMCkge1xuICAgIGxldCBzdHIgPSBzdXBlci50b1N0cmluZyhpbmRlbnQpICsgXCJcXG5cIjtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiU3ViYWRkcmVzcyBpbmRleFwiLCB0aGlzLmdldFN1YmFkZHJlc3NJbmRleCgpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJBZGRyZXNzXCIsIHRoaXMuZ2V0QWRkcmVzcygpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJOdW0gc3VnZ2VzdGVkIGNvbmZpcm1hdGlvbnNcIiwgdGhpcy5nZXROdW1TdWdnZXN0ZWRDb25maXJtYXRpb25zKCksIGluZGVudCk7XG4gICAgcmV0dXJuIHN0ci5zbGljZSgwLCBzdHIubGVuZ3RoIC0gMSk7ICAvLyBzdHJpcCBsYXN0IG5ld2xpbmVcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tIE9WRVJSSURFIENPVkFSSUFOVCBSRVRVUk4gVFlQRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgc2V0VHgodHg6IE1vbmVyb1R4V2FsbGV0KTogTW9uZXJvSW5jb21pbmdUcmFuc2ZlciB7XG4gICAgc3VwZXIuc2V0VHgodHgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBzZXRBbW91bnQoYW1vdW50OiBiaWdpbnQpOiBNb25lcm9JbmNvbWluZ1RyYW5zZmVyIHtcbiAgICBzdXBlci5zZXRBbW91bnQoYW1vdW50KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgc2V0QWNjb3VudEluZGV4KGFjY291bnRJbmRleDogbnVtYmVyKTogTW9uZXJvSW5jb21pbmdUcmFuc2ZlciB7XG4gICAgc3VwZXIuc2V0QWNjb3VudEluZGV4KGFjY291bnRJbmRleCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6InlMQUFBLElBQUFBLE9BQUEsR0FBQUMsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFDLFNBQUEsR0FBQUYsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFFLGVBQUEsR0FBQUgs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