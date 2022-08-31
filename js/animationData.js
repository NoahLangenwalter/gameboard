export class AnimationData {
    _status = false;
    _start = null;
    constructor(duration) {
        this._duration = duration;
    }

    get status() { return this._status };
    get duration() { return this._duration }

    start() {
        this._start = Date.now();
        this._status = true;
    }

    end() {
        this._start = null;
        this._status = false;
        this._currentTime = null;
    }
    update() {
        this._currentTime = Date.now();
    }

    get elapsed() {
        return this._currentTime - this._start;
    }

    get elapsedPercent() {
        return this.elapsed / this._duration;
    }
}