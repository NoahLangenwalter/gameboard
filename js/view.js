export class View {
    #scale = 1;
    #offset = { x: 0, y: 0 };
    maxZoom = 2;
    minZoom = 0.1;

    constructor(context) {
        this.ctx = context;
    }

    get scale() { return this.#scale };
    get offset() { return this.#offset };

    apply() {
        this.ctx.setTransform(this.scale, 0, 0, this.scale, this.#offset.x, this.#offset.y)
    }

    setUp(offset, scale) {
        this.#offset = offset;
        this.#scale = scale;
    }

    pan(amount) {
        // this.update();
        this.#offset.x += amount.x;
        this.#offset.y += amount.y;
    }

    scaleAt(at, amount) { // at in screen coords
        // this.update();
        this.#scale *= amount;
        this.#scale = Math.min(Math.max(this.#scale, this.minZoom), this.maxZoom);
        this.#offset.x = at.x - (at.x - this.#offset.x) * amount;
        this.#offset.y = at.y - (at.y - this.#offset.y) * amount;
    }

    toScreen(x, y) {
        const point = {};
        point.x = x * this.#scale + this.offset.x;
        point.y = y * this.#scale + this.offset.y;
        return point;
    }

    toWorld(x, y) {   // converts from screen coords to world coords
        const point = {};
        const inv = 1 / this.#scale;
        point.x = (x - this.#offset.x) * inv;
        point.y = (y - this.#offset.y) * inv;
        return point;
    }

    applyTransformTo(x, y) {
        const point = {};
        point.x = (x + this.offset.x/this.#scale) * this.#scale;
        point.y = (y + this.offset.y/this.#scale) * this.#scale;
        return point;
    }
}