"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _MoneroRpcConnection = _interopRequireDefault(require("../../common/MoneroRpcConnection"));

/**
 * Configuration to connect to monerod.
 */
class MoneroDaemonConfig {






  /**
   * Construct a configuration to open or create a wallet.
   * 
   * @param {Partial<MoneroDaemonConfig>} [config] - MoneroDaemonConfig to construct from (optional)
   * @param {string|Partial<MoneroRpcConnection>} [config.server] - uri or MoneroRpcConnection to the daemon (optional)
   * @param {boolean} [config.proxyToWorker] - proxy daemon requests to a worker (default true)
   * @param {string[]} [config.cmd] - command to start monerod (optional)
   * @param {number} [config.pollInterval] - interval in milliseconds to poll the daemon for updates (default 20000)
   */
  constructor(config) {
    Object.assign(this, config);
    if (this.server) this.setServer(this.server);
    this.setProxyToWorker(this.proxyToWorker);
  }

  copy() {
    return new MoneroDaemonConfig(this);
  }

  toJson() {
    let json = Object.assign({}, this);
    if (json.server) json.server = json.server.toJson();
    return json;
  }

  getServer() {
    return this.server;
  }

  setServer(server) {
    if (server && !(server instanceof _MoneroRpcConnection.default)) server = new _MoneroRpcConnection.default(server);
    this.server = server;
    return this;
  }

  getProxyToWorker() {
    return this.proxyToWorker;
  }

  setProxyToWorker(proxyToWorker) {
    this.proxyToWorker = proxyToWorker;
    return this;
  }

  getCmd() {
    return this.cmd;
  }

  setCmd(cmd) {
    this.cmd = cmd;
    return this;
  }

  getPollInterval() {
    return this.pollInterval;
  }

  setPollInterval(pollInterval) {
    this.pollInterval = pollInterval;
    return this;
  }
}exports.default = MoneroDaemonConfig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfTW9uZXJvUnBjQ29ubmVjdGlvbiIsIl9pbnRlcm9wUmVxdWlyZURlZmF1bHQiLCJyZXF1aXJlIiwiTW9uZXJvRGFlbW9uQ29uZmlnIiwiY29uc3RydWN0b3IiLCJjb25maWciLCJPYmplY3QiLCJhc3NpZ24iLCJzZXJ2ZXIiLCJzZXRTZXJ2ZXIiLCJzZXRQcm94eVRvV29ya2VyIiwicHJveHlUb1dvcmtlciIsImNvcHkiLCJ0b0pzb24iLCJqc29uIiwiZ2V0U2VydmVyIiwiTW9uZXJvUnBjQ29ubmVjdGlvbiIsImdldFByb3h5VG9Xb3JrZXIiLCJnZXRDbWQiLCJjbWQiLCJzZXRDbWQiLCJnZXRQb2xsSW50ZXJ2YWwiLCJwb2xsSW50ZXJ2YWwiLCJzZXRQb2xsSW50ZXJ2YWwiLCJleHBvcnRzIiwiZGVmYXVsdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3RzL2RhZW1vbi9tb2RlbC9Nb25lcm9EYWVtb25Db25maWcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1vbmVyb1JwY0Nvbm5lY3Rpb24gZnJvbSBcIi4uLy4uL2NvbW1vbi9Nb25lcm9ScGNDb25uZWN0aW9uXCI7XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiB0byBjb25uZWN0IHRvIG1vbmVyb2QuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vbmVyb0RhZW1vbkNvbmZpZyB7XG5cbiAgc2VydmVyOiBzdHJpbmcgfCBQYXJ0aWFsPE1vbmVyb1JwY0Nvbm5lY3Rpb24+O1xuICBwcm94eVRvV29ya2VyOiBib29sZWFuO1xuICBjbWQ6IHN0cmluZ1tdO1xuICBwb2xsSW50ZXJ2YWw6IG51bWJlcjtcbiAgXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBjb25maWd1cmF0aW9uIHRvIG9wZW4gb3IgY3JlYXRlIGEgd2FsbGV0LlxuICAgKiBcbiAgICogQHBhcmFtIHtQYXJ0aWFsPE1vbmVyb0RhZW1vbkNvbmZpZz59IFtjb25maWddIC0gTW9uZXJvRGFlbW9uQ29uZmlnIHRvIGNvbnN0cnVjdCBmcm9tIChvcHRpb25hbClcbiAgICogQHBhcmFtIHtzdHJpbmd8UGFydGlhbDxNb25lcm9ScGNDb25uZWN0aW9uPn0gW2NvbmZpZy5zZXJ2ZXJdIC0gdXJpIG9yIE1vbmVyb1JwY0Nvbm5lY3Rpb24gdG8gdGhlIGRhZW1vbiAob3B0aW9uYWwpXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NvbmZpZy5wcm94eVRvV29ya2VyXSAtIHByb3h5IGRhZW1vbiByZXF1ZXN0cyB0byBhIHdvcmtlciAoZGVmYXVsdCB0cnVlKVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBbY29uZmlnLmNtZF0gLSBjb21tYW5kIHRvIHN0YXJ0IG1vbmVyb2QgKG9wdGlvbmFsKVxuICAgKiBAcGFyYW0ge251bWJlcn0gW2NvbmZpZy5wb2xsSW50ZXJ2YWxdIC0gaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzIHRvIHBvbGwgdGhlIGRhZW1vbiBmb3IgdXBkYXRlcyAoZGVmYXVsdCAyMDAwMClcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbmZpZz86IFBhcnRpYWw8TW9uZXJvRGFlbW9uQ29uZmlnPikge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcywgY29uZmlnKTtcbiAgICBpZiAodGhpcy5zZXJ2ZXIpIHRoaXMuc2V0U2VydmVyKHRoaXMuc2VydmVyKTtcbiAgICB0aGlzLnNldFByb3h5VG9Xb3JrZXIodGhpcy5wcm94eVRvV29ya2VyKTtcbiAgfVxuXG4gIGNvcHkoKTogTW9uZXJvRGFlbW9uQ29uZmlnIHtcbiAgICByZXR1cm4gbmV3IE1vbmVyb0RhZW1vbkNvbmZpZyh0aGlzKTtcbiAgfVxuICBcbiAgdG9Kc29uKCk6IGFueSB7XG4gICAgbGV0IGpzb246IGFueSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMpO1xuICAgIGlmIChqc29uLnNlcnZlcikganNvbi5zZXJ2ZXIgPSBqc29uLnNlcnZlci50b0pzb24oKTtcbiAgICByZXR1cm4ganNvbjtcbiAgfVxuICBcbiAgZ2V0U2VydmVyKCk6IE1vbmVyb1JwY0Nvbm5lY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLnNlcnZlciBhcyBNb25lcm9ScGNDb25uZWN0aW9uO1xuICB9XG4gIFxuICBzZXRTZXJ2ZXIoc2VydmVyOiBQYXJ0aWFsPE1vbmVyb1JwY0Nvbm5lY3Rpb24+IHwgc3RyaW5nKTogTW9uZXJvRGFlbW9uQ29uZmlnIHtcbiAgICBpZiAoc2VydmVyICYmICEoc2VydmVyIGluc3RhbmNlb2YgTW9uZXJvUnBjQ29ubmVjdGlvbikpIHNlcnZlciA9IG5ldyBNb25lcm9ScGNDb25uZWN0aW9uKHNlcnZlcik7XG4gICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXIgYXMgTW9uZXJvUnBjQ29ubmVjdGlvbjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgZ2V0UHJveHlUb1dvcmtlcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wcm94eVRvV29ya2VyO1xuICB9XG4gIFxuICBzZXRQcm94eVRvV29ya2VyKHByb3h5VG9Xb3JrZXI6IGJvb2xlYW4pOiBNb25lcm9EYWVtb25Db25maWcge1xuICAgIHRoaXMucHJveHlUb1dvcmtlciA9IHByb3h5VG9Xb3JrZXI7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXRDbWQoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmNtZDtcbiAgfVxuXG4gIHNldENtZChjbWQ6IHN0cmluZ1tdKTogTW9uZXJvRGFlbW9uQ29uZmlnIHtcbiAgICB0aGlzLmNtZCA9IGNtZDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldFBvbGxJbnRlcnZhbCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnBvbGxJbnRlcnZhbDtcbiAgfVxuXG4gIHNldFBvbGxJbnRlcnZhbChwb2xsSW50ZXJ2YWw6IG51bWJlcik6IE1vbmVyb0RhZW1vbkNvbmZpZyB7XG4gICAgdGhpcy5wb2xsSW50ZXJ2YWwgPSBwb2xsSW50ZXJ2YWw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0iXSwibWFwcGluZ3MiOiJ5TEFBQSxJQUFBQSxvQkFBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNlLE1BQU1DLGtCQUFrQixDQUFDOzs7Ozs7O0VBT3RDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFDQyxNQUFvQyxFQUFFO0lBQ2hEQyxNQUFNLENBQUNDLE1BQU0sQ0FBQyxJQUFJLEVBQUVGLE1BQU0sQ0FBQztJQUMzQixJQUFJLElBQUksQ0FBQ0csTUFBTSxFQUFFLElBQUksQ0FBQ0MsU0FBUyxDQUFDLElBQUksQ0FBQ0QsTUFBTSxDQUFDO0lBQzVDLElBQUksQ0FBQ0UsZ0JBQWdCLENBQUMsSUFBSSxDQUFDQyxhQUFhLENBQUM7RUFDM0M7O0VBRUFDLElBQUlBLENBQUEsRUFBdUI7SUFDekIsT0FBTyxJQUFJVCxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7RUFDckM7O0VBRUFVLE1BQU1BLENBQUEsRUFBUTtJQUNaLElBQUlDLElBQVMsR0FBR1IsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0lBQ3ZDLElBQUlPLElBQUksQ0FBQ04sTUFBTSxFQUFFTSxJQUFJLENBQUNOLE1BQU0sR0FBR00sSUFBSSxDQUFDTixNQUFNLENBQUNLLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELE9BQU9DLElBQUk7RUFDYjs7RUFFQUMsU0FBU0EsQ0FBQSxFQUF3QjtJQUMvQixPQUFPLElBQUksQ0FBQ1AsTUFBTTtFQUNwQjs7RUFFQUMsU0FBU0EsQ0FBQ0QsTUFBNkMsRUFBc0I7SUFDM0UsSUFBSUEsTUFBTSxJQUFJLEVBQUVBLE1BQU0sWUFBWVEsNEJBQW1CLENBQUMsRUFBRVIsTUFBTSxHQUFHLElBQUlRLDRCQUFtQixDQUFDUixNQUFNLENBQUM7SUFDaEcsSUFBSSxDQUFDQSxNQUFNLEdBQUdBLE1BQTZCO0lBQzNDLE9BQU8sSUFBSTtFQUNiOztFQUVBUyxnQkFBZ0JBLENBQUEsRUFBWTtJQUMxQixPQUFPLElBQUksQ0FBQ04sYUFBYTtFQUMzQjs7RUFFQUQsZ0JBQWdCQSxDQUFDQyxhQUFzQixFQUFzQjtJQUMzRCxJQUFJLENBQUNBLGFBQWEsR0FBR0EsYUFBYTtJQUNsQyxPQUFPLElBQUk7RUFDYjs7RUFFQU8sTUFBTUEsQ0FBQSxFQUFhO0lBQ2pCLE9BQU8sSUFBSSxDQUFDQyxHQUFHO0VBQ2pCOztFQUVBQyxNQUFNQSxDQUFDRCxHQUFhLEVBQXNCO0lBQ3hDLElBQUksQ0FBQ0EsR0FBRyxHQUFHQSxHQUFHO0lBQ2QsT0FBTyxJQUFJO0VBQ2I7O0VBRUFFLGVBQWVBLENBQUEsRUFBVztJQUN4QixPQUFPLElBQUksQ0FBQ0MsWUFBWTtFQUMxQjs7RUFFQUMsZUFBZUEsQ0FBQ0QsWUFBb0IsRUFBc0I7SUFDeEQsSUFBSSxDQUFDQSxZQUFZLEdBQUdBLFlBQVk7SUFDaEMsT0FBTyxJQUFJO0VBQ2I7QUFDRixDQUFDRSxPQUFBLENBQUFDLE9BQUEsR0FBQXRCLGtCQUFBIn0=