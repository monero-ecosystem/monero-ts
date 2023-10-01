import MoneroBlockHeader from "./MoneroBlockHeader";

/**
 * Receives notifications as a daemon is updated.
 */
export default class MoneroDaemonListener {

  protected lastHeader: MoneroBlockHeader;
  
  /**
   * Called when a new block is added to the chain.
   * 
   * @param {MoneroBlockHeader} header - the header of the block added to the chain
   */
  async onBlockHeader(header: MoneroBlockHeader) {
    this.lastHeader = header;
  }
  
  /**
   * Get the last notified block header.
   * 
   * @return {MoneroBlockHeader} the last notified block header
   */
  getLastBlockHeader(): MoneroBlockHeader {
    return this.lastHeader;
  }
}
