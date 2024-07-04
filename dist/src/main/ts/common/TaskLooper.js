"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0; /**
 * Run a task in a fixed period loop.
 */
class TaskLooper {







  /**
   * Build the looper with a function to invoke on a fixed period loop.
   * 
   * @param {function} fn - the async function to invoke
   */
  constructor(fn) {
    this._fn = fn;
    this._isStarted = false;
    this._isLooping = false;
  }

  /**
   * Get the task function to invoke on a fixed period loop.
   * 
   * @return {function} the task function
   */
  getTask() {
    return this._fn;
  }

  /**
   * Start the task loop.
   * 
   * @param {number} periodInMs the loop period in milliseconds
   * @param {boolean} targetFixedPeriod specifies if the task should target a fixed period by accounting for run time (default false)
   * @return {TaskLooper} this instance for chaining
   */
  start(periodInMs, targetFixedPeriod) {
    if (periodInMs <= 0) throw new Error("Looper period must be greater than 0 ms");
    this.setPeriodInMs(periodInMs);
    if (this._isStarted) return;
    this._isStarted = true;
    this._runLoop(targetFixedPeriod);
  }

  /**
   * Indicates if looping.
   * 
   * @return {boolean} true if looping, false otherwise
   */
  isStarted() {
    return this._isStarted;
  }

  /**
   * Stop the task loop.
   */
  stop() {
    this._isStarted = false;
    clearTimeout(this._timeout);
    this._timeout = undefined;
  }

  /**
   * Set the loop period in milliseconds.
   * 
   * @param {number} periodInMs the loop period in milliseconds
   */
  setPeriodInMs(periodInMs) {
    if (periodInMs <= 0) throw new Error("Looper period must be greater than 0 ms");
    this._periodInMs = periodInMs;
  }

  async _runLoop(targetFixedPeriod) {
    this._isLooping = true;
    while (this._isStarted) {
      const startTime = Date.now();
      await this._fn();
      let that = this;
      if (this._isStarted) await new Promise((resolve) => {this._timeout = setTimeout(resolve, that._periodInMs - (targetFixedPeriod ? Date.now() - startTime : 0));});
    }
    this._isLooping = false;
  }
}exports.default = TaskLooper;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYXNrTG9vcGVyIiwiY29uc3RydWN0b3IiLCJmbiIsIl9mbiIsIl9pc1N0YXJ0ZWQiLCJfaXNMb29waW5nIiwiZ2V0VGFzayIsInN0YXJ0IiwicGVyaW9kSW5NcyIsInRhcmdldEZpeGVkUGVyaW9kIiwiRXJyb3IiLCJzZXRQZXJpb2RJbk1zIiwiX3J1bkxvb3AiLCJpc1N0YXJ0ZWQiLCJzdG9wIiwiY2xlYXJUaW1lb3V0IiwiX3RpbWVvdXQiLCJ1bmRlZmluZWQiLCJfcGVyaW9kSW5NcyIsInN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJ0aGF0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZXRUaW1lb3V0IiwiZXhwb3J0cyIsImRlZmF1bHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi90cy9jb21tb24vVGFza0xvb3Blci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJ1biBhIHRhc2sgaW4gYSBmaXhlZCBwZXJpb2QgbG9vcC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFza0xvb3BlciB7XG5cbiAgX2ZuOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBfaXNTdGFydGVkOiBib29sZWFuO1xuICBfaXNMb29waW5nOiBib29sZWFuO1xuICBfcGVyaW9kSW5NczogbnVtYmVyO1xuICBfdGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQ7XG4gIFxuICAvKipcbiAgICogQnVpbGQgdGhlIGxvb3BlciB3aXRoIGEgZnVuY3Rpb24gdG8gaW52b2tlIG9uIGEgZml4ZWQgcGVyaW9kIGxvb3AuXG4gICAqIFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiAtIHRoZSBhc3luYyBmdW5jdGlvbiB0byBpbnZva2VcbiAgICovXG4gIGNvbnN0cnVjdG9yKGZuOiAoKSA9PiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgdGhpcy5fZm4gPSBmbjtcbiAgICB0aGlzLl9pc1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9pc0xvb3BpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHRhc2sgZnVuY3Rpb24gdG8gaW52b2tlIG9uIGEgZml4ZWQgcGVyaW9kIGxvb3AuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtmdW5jdGlvbn0gdGhlIHRhc2sgZnVuY3Rpb25cbiAgICovXG4gIGdldFRhc2soKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZuO1xuICB9XG4gIFxuICAvKipcbiAgICogU3RhcnQgdGhlIHRhc2sgbG9vcC5cbiAgICogXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwZXJpb2RJbk1zIHRoZSBsb29wIHBlcmlvZCBpbiBtaWxsaXNlY29uZHNcbiAgICogQHBhcmFtIHtib29sZWFufSB0YXJnZXRGaXhlZFBlcmlvZCBzcGVjaWZpZXMgaWYgdGhlIHRhc2sgc2hvdWxkIHRhcmdldCBhIGZpeGVkIHBlcmlvZCBieSBhY2NvdW50aW5nIGZvciBydW4gdGltZSAoZGVmYXVsdCBmYWxzZSlcbiAgICogQHJldHVybiB7VGFza0xvb3Blcn0gdGhpcyBpbnN0YW5jZSBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHN0YXJ0KHBlcmlvZEluTXM6IG51bWJlciwgdGFyZ2V0Rml4ZWRQZXJpb2Q/OiBib29sZWFuKSB7XG4gICAgaWYgKHBlcmlvZEluTXMgPD0gMCkgdGhyb3cgbmV3IEVycm9yKFwiTG9vcGVyIHBlcmlvZCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAwIG1zXCIpO1xuICAgIHRoaXMuc2V0UGVyaW9kSW5NcyhwZXJpb2RJbk1zKTtcbiAgICBpZiAodGhpcy5faXNTdGFydGVkKSByZXR1cm47XG4gICAgdGhpcy5faXNTdGFydGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9ydW5Mb29wKHRhcmdldEZpeGVkUGVyaW9kKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgaWYgbG9vcGluZy5cbiAgICogXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgbG9vcGluZywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAqL1xuICBpc1N0YXJ0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzU3RhcnRlZDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFN0b3AgdGhlIHRhc2sgbG9vcC5cbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5faXNTdGFydGVkID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQhKTtcbiAgICB0aGlzLl90aW1lb3V0ID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgbG9vcCBwZXJpb2QgaW4gbWlsbGlzZWNvbmRzLlxuICAgKiBcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBlcmlvZEluTXMgdGhlIGxvb3AgcGVyaW9kIGluIG1pbGxpc2Vjb25kc1xuICAgKi9cbiAgICBzZXRQZXJpb2RJbk1zKHBlcmlvZEluTXMpIHtcbiAgICAgIGlmIChwZXJpb2RJbk1zIDw9IDApIHRocm93IG5ldyBFcnJvcihcIkxvb3BlciBwZXJpb2QgbXVzdCBiZSBncmVhdGVyIHRoYW4gMCBtc1wiKTtcbiAgICAgIHRoaXMuX3BlcmlvZEluTXMgPSBwZXJpb2RJbk1zO1xuICAgIH1cbiAgXG4gIGFzeW5jIF9ydW5Mb29wKHRhcmdldEZpeGVkUGVyaW9kOiBib29sZWFuKSB7XG4gICAgdGhpcy5faXNMb29waW5nID0gdHJ1ZTtcbiAgICB3aGlsZSAodGhpcy5faXNTdGFydGVkKSB7XG4gICAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgYXdhaXQgdGhpcy5fZm4oKTtcbiAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgIGlmICh0aGlzLl9pc1N0YXJ0ZWQpIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7IHRoaXMuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KHJlc29sdmUsIHRoYXQuX3BlcmlvZEluTXMgLSAodGFyZ2V0Rml4ZWRQZXJpb2QgPyAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgOiAwKSk7IH0pO1xuICAgIH1cbiAgICB0aGlzLl9pc0xvb3Bp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