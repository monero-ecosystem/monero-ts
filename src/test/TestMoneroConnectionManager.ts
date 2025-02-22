import assert from "assert";
import TestUtils from "./utils/TestUtils";
import {
  GenUtils,
  MoneroWalletRpc,
  MoneroConnectionManager,
  MoneroConnectionManagerListener,
  MoneroRpcConnection
} from "../../index";

/**
 * Test the Monero RPC connection manager.
 */
class TestMoneroConnectionManager {
  
  runTests() {
    describe("Test connection manager", function() {
      it("Can manage connections", async function() {
        let err;
        let walletRpcs: MoneroWalletRpc[] = [];
        let connectionManager: MoneroConnectionManager;
        try {
          
          // start monero-wallet-rpc instances as test server connections (can also use monerod servers)
          for (let i = 0; i < 5; i++) walletRpcs.push(await TestUtils.startWalletRpcProcess());
          
          // create connection manager
          connectionManager = new MoneroConnectionManager();
          
          // listen for changes
          let listener = new ConnectionChangeCollector();
          connectionManager.addListener(listener);
          
          // add prioritized connections
          await connectionManager.addConnection(walletRpcs[4].getRpcConnection()!.setPriority(1));
          await connectionManager.addConnection(walletRpcs[2].getRpcConnection()!.setPriority(2));
          await connectionManager.addConnection(walletRpcs[3].getRpcConnection()!.setPriority(2));
          await connectionManager.addConnection(walletRpcs[0].getRpcConnection()); // default priority is lowest
          await connectionManager.addConnection(new MoneroRpcConnection(walletRpcs[1].getRpcConnection()!.getUri())); // test unauthenticated
          
          // test connections and order
          let orderedConnections = connectionManager.getConnections();
          assert(orderedConnections[0] === walletRpcs[4].getRpcConnection());
          assert(orderedConnections[1] === walletRpcs[2].getRpcConnection());
          assert(orderedConnections[2] === walletRpcs[3].getRpcConnection());
          assert(orderedConnections[3] === walletRpcs[0].getRpcConnection());
          assert.equal(orderedConnections[4].getUri(), (walletRpcs[1].getRpcConnection()!).getUri());
          for (let connection of orderedConnections) assert.equal(undefined, connection.getIsOnline());

          // test getting connection by uri
          assert(connectionManager.hasConnection(walletRpcs[0].getRpcConnection()!.getUri()));
          assert(connectionManager.getConnectionByUri(walletRpcs[0].getRpcConnection()!.getUri()) === walletRpcs[0].getRpcConnection());

          // test unknown connection
          let numExpectedChanges = 0;
          await connectionManager.setConnection(orderedConnections[0]);
          assert.equal(connectionManager.isConnected(), undefined);
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          
          // auto connect to best available connection
          connectionManager.startPolling(TestUtils.SYNC_PERIOD_IN_MS);
          await GenUtils.waitFor(TestUtils.AUTO_CONNECT_TIMEOUT_MS);
          assert(connectionManager.isConnected());
          let connection = connectionManager.getConnection();
          assert(connection.getIsOnline());
          assert(connection === walletRpcs[4].getRpcConnection());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert(listener.changedConnections[listener.changedConnections.length - 1] === connection);
          connectionManager.setAutoSwitch(false);
          connectionManager.stopPolling();
          await connectionManager.disconnect();
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert(listener.changedConnections[listener.changedConnections.length - 1] === undefined);
          
          // start periodically checking connection without auto switch
          await connectionManager.startPolling(TestUtils.SYNC_PERIOD_IN_MS, false);
          
          // connect to best available connection in order of priority and response time
          connection = await connectionManager.getBestAvailableConnection();
          await connectionManager.setConnection(connection);
          assert(connection === walletRpcs[4].getRpcConnection());
          assert(connection.getIsOnline());
          assert(connection.getIsAuthenticated());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert(listener.changedConnections[listener.changedConnections.length - 1] === connection);
          
          // test connections and order
          orderedConnections = connectionManager.getConnections();
          assert(orderedConnections[0] === walletRpcs[4].getRpcConnection());
          assert(orderedConnections[1] === walletRpcs[2].getRpcConnection());
          assert(orderedConnections[2] === walletRpcs[3].getRpcConnection());
          assert(orderedConnections[3] === walletRpcs[0].getRpcConnection());
          assert.equal(orderedConnections[4].getUri(), walletRpcs[1].getRpcConnection()!.getUri());
          for (let i = 1; i < orderedConnections.length; i++) assert.equal(undefined, orderedConnections[i].getIsOnline());
          
          // shut down prioritized servers
          walletRpcs[2].getRpcConnection()!.setFakeDisconnected(true); // browser does not start or stop instances
          walletRpcs[3].getRpcConnection()!.setFakeDisconnected(true);
          walletRpcs[4].getRpcConnection()!.setFakeDisconnected(true);
          await GenUtils.waitFor(TestUtils.SYNC_PERIOD_IN_MS + 100);
          assert.equal(false, connectionManager.isConnected());
          assert.equal(false, connectionManager.getConnection().getIsOnline());
          assert.equal(undefined, connectionManager.getConnection().getIsAuthenticated());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert(listener.changedConnections[listener.changedConnections.length - 1] === connectionManager.getConnection());
          
          // test connection order
          orderedConnections = connectionManager.getConnections();
          assert(orderedConnections[0] === walletRpcs[4].getRpcConnection());
          assert(orderedConnections[1] === walletRpcs[0].getRpcConnection());
          assert.equal(orderedConnections[2].getUri(), walletRpcs[1].getRpcConnection()!.getUri());
          assert(orderedConnections[3] === walletRpcs[2].getRpcConnection());
          assert(orderedConnections[4] === walletRpcs[3].getRpcConnection());
          
          // check all connections
          await connectionManager.checkConnections();
          
          // test connection order
          orderedConnections = connectionManager.getConnections();
          assert(orderedConnections[0] === walletRpcs[4].getRpcConnection());
          assert(orderedConnections[1] === walletRpcs[0].getRpcConnection());
          assert(orderedConnections[2].getUri() === walletRpcs[1].getRpcConnection()!.getUri());
          assert(orderedConnections[3] === walletRpcs[2].getRpcConnection());
          assert(orderedConnections[4] === walletRpcs[3].getRpcConnection());
          
          // test online and authentication status
          for (let i = 0; i < orderedConnections.length; i++) {
            let isOnline = orderedConnections[i].getIsOnline();
            let isAuthenticated = orderedConnections[i].getIsAuthenticated();
            if (i === 1 || i === 2) assert.equal(true, isOnline);
            else assert.equal(false, isOnline);
            if (i === 1) assert.equal(true, isAuthenticated);
            else if (i === 2) assert.equal(false, isAuthenticated);
            else assert.equal(undefined, isAuthenticated);
          }
          
          // test auto switch when disconnected
          connectionManager.setAutoSwitch(true);
          await GenUtils.waitFor(TestUtils.SYNC_PERIOD_IN_MS + 100); // allow time to poll
          assert(connectionManager.isConnected());
          connection = connectionManager.getConnection();
          assert(connection.getIsOnline());
          assert(connection === walletRpcs[0].getRpcConnection());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert(listener.changedConnections[listener.changedConnections.length - 1] === connection);
          
          // test connection order
          orderedConnections = connectionManager.getConnections();
          assert(orderedConnections[0] === connection);
          assert(orderedConnections[0] === walletRpcs[0].getRpcConnection());
          assert(orderedConnections[1].getUri() === walletRpcs[1].getRpcConnection()!.getUri());
          assert(orderedConnections[2] === walletRpcs[4].getRpcConnection());
          assert(orderedConnections[3] === walletRpcs[2].getRpcConnection());
          assert(orderedConnections[4] === walletRpcs[3].getRpcConnection());
          
          // connect to specific endpoint without authentication
          connection = orderedConnections[1];
          assert.equal(false, connection.getIsAuthenticated());
          await connectionManager.setConnection(connection);
          assert.equal(false, connectionManager.isConnected());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          
          // connect to specific endpoint with authentication
          orderedConnections[1].setCredentials("rpc_user", "abc123");
          await connectionManager.checkConnection();
          assert.equal(connectionManager.getConnection().getUri(), walletRpcs[1].getRpcConnection()!.getUri());
          assert.equal(connection.getUri(), walletRpcs[1].getRpcConnection()!.getUri());
          assert(connection.getIsOnline());
          assert(connection.getIsAuthenticated());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert(listener.changedConnections[listener.changedConnections.length - 1] === connection);
          
          // test connection order
          orderedConnections = connectionManager.getConnections();
          assert(orderedConnections[0] === connectionManager.getConnection());
          assert.equal(orderedConnections[0].getUri(), walletRpcs[1].getRpcConnection()!.getUri());
          assert(orderedConnections[1] === walletRpcs[0].getRpcConnection());
          assert(orderedConnections[2] === walletRpcs[4].getRpcConnection());
          assert(orderedConnections[3] === walletRpcs[2].getRpcConnection());
          assert(orderedConnections[4] === walletRpcs[3].getRpcConnection());
          for (let i = 0; i < orderedConnections.length; i++) assert(i <= 1 ? orderedConnections[i].getIsOnline() : !orderedConnections[i].getIsOnline());
          
          // set connection to existing uri
          await connectionManager.setConnection(walletRpcs[0].getRpcConnection()!.getUri());
          assert(connectionManager.isConnected());
          assert(walletRpcs[0].getRpcConnection() === connectionManager.getConnection());
          assert.equal(TestUtils.WALLET_RPC_CONFIG.username, connectionManager.getConnection().getUsername());
          assert.equal(TestUtils.WALLET_RPC_CONFIG.password, connectionManager.getConnection().getPassword());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert(listener.changedConnections[listener.changedConnections.length - 1] === walletRpcs[0].getRpcConnection());
          
          // set connection to new uri
          connectionManager.stopPolling();
          let uri = "http://localhost:49999";
          await connectionManager.setConnection(uri);
          assert.equal(connectionManager.getConnection().getUri(), uri);
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert.equal(uri, listener.changedConnections[listener.changedConnections.length - 1].getUri());
          
          // set connection to empty string
          await connectionManager.setConnection("");
          assert.equal(undefined, connectionManager.getConnection());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          
          // check all connections and test auto switch
          await connectionManager.checkConnections();
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert(connectionManager.isConnected());

          // remove current connection and test auto switch
          await connectionManager.removeConnection(connectionManager.getConnection().getUri());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert.equal(connectionManager.isConnected(), false);
          await connectionManager.checkConnections();
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert(connectionManager.isConnected());

          // check connection promises
          await Promise.all(connectionManager.checkConnectionPromises());

          // test polling current connection
          await connectionManager.setConnection();
          assert.equal(connectionManager.isConnected(), false);
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          connectionManager.startPolling(TestUtils.SYNC_PERIOD_IN_MS, undefined, undefined, MoneroConnectionManager.PollType.CURRENT, undefined);
          await GenUtils.waitFor(TestUtils.AUTO_CONNECT_TIMEOUT_MS);
          assert(connectionManager.isConnected());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);

          // test polling all connections
          await connectionManager.setConnection();
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          connectionManager.startPolling(TestUtils.SYNC_PERIOD_IN_MS, undefined, undefined, MoneroConnectionManager.PollType.ALL, undefined);
          await GenUtils.waitFor(TestUtils.AUTO_CONNECT_TIMEOUT_MS);
          assert(connectionManager.isConnected());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          
          // shut down all connections
          connection = connectionManager.getConnection();
          for (let connection of orderedConnections) connection.setFakeDisconnected(true);
          await GenUtils.waitFor(TestUtils.SYNC_PERIOD_IN_MS + 100);
          assert.equal(false, connection.getIsOnline());
          assert.equal(listener.changedConnections.length, ++numExpectedChanges);
          assert(listener.changedConnections[listener.changedConnections.length - 1] === connection);
          
          // reset
          connectionManager.reset();
          assert.equal(connectionManager.getConnections().length, 0);
          assert.equal(connectionManager.getConnection(), undefined);
        } catch(err2) {
          err = err2;
        }

        // stop connection manager
        if (connectionManager) connectionManager.reset();
        
        // stop monero-wallet-rpc instances
        for (let walletRpc of walletRpcs) {
          try { await TestUtils.stopWalletRpcProcess(walletRpc); }
          catch (err2) { }
        }
        
        // throw error if applicable
        if (err) throw err;
      });
    });
  }
}

class ConnectionChangeCollector extends MoneroConnectionManagerListener {

  changedConnections: MoneroRpcConnection[] = [];

  constructor() {
    super();
    this.changedConnections = [];
  }
  async onConnectionChanged(connection) {
    this.changedConnections.push(connection);
  }
}

export default TestMoneroConnectionManager;
