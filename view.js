export class View {
    constructor(context) {
        this.ctx = context;                 // reference to the 2D context
        // this.matrix = [1, 0, 0, 1, 0, 0];   // current view transform
        this._scale = 1;                    // current scale
        this.pos = { x: 0, y: 0 };          // current position of origin
        this.maxZoom = 2;
        this.minZoom = 0.1;
    }

    get scale() { return this._scale };
    get position() { return this.pos };

    apply() {
        // let m = this.matrix;
        // this.update();
        this.ctx.setTransform(this.scale, 0, 0, this.scale, this.pos.x, this.pos.y)
        // this.ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    }

    isDirty() { return this.dirty }

    update() {
        let m = this.matrix;
        m[3] = m[0] = this._scale;
        m[2] = m[1] = 0;
        m[4] = this.pos.x;
        m[5] = this.pos.y;
    }

    pan(amount) {
        // this.update();
        this.pos.x += amount.x;
        this.pos.y += amount.y;
    }

    scaleAt(at, amount) { // at in screen coords
        // this.update();
        this._scale *= amount;
        this._scale = Math.min(Math.max(this._scale, this.minZoom), this.maxZoom);
        this.pos.x = at.x - (at.x - this.pos.x) * amount;
        this.pos.y = at.y - (at.y - this.pos.y) * amount;
    }

    toWorld(x, y) {   // converts from screen coords to world coords
        const point = {};
        const inv = 1 / this.scale;
        point.x = (x - this.pos.x) * inv;
        point.y = (y - this.pos.y) * inv;
        return point;
    }
}