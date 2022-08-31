export class GameObject {
    width = 100;
    height = 100;
    cornerRadius = 20;
    dragging = false;
    hovering = false;
    selected = false;
    isCardTarget = false;
    isEditable = false;
    isShuffleable = false;

    constructor(game, startX = 0, startY = 0, startZ = -1) {
        this.game = game;
        this._x = startX;
        this._y = startY;
        this._z = startZ;
    }

    get bottom() { return this.y + this.height }
    get right() { return this.x + this.width }
    get isInteractable() { return true }
    get x() { return this._x }
    get y() { return this._y }
    get z() { return this._z }
    set x(v) { this._x = v }
    set y(v) { this._y = v }
    set z(v) { this._z = v }

    activate() {
        // console.log("Activated: " + this);
    }

    pickUp() {
        this.dragging = true;
    }

    putDown() {
        this.dragging = false;
    }

    hoverEnter() {
        this.hovering = true;
    }

    hoverLeave() {
        this.hovering = false;
    }

    select() {
        this.selected = true;
    }

    deselect() {
        this.selected = false;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    update() {
        // console.log("Updated: " + this);
    }

    drawHighlight(context) {
        if (this.hovering) {
            this.game.ctx.setTransform(1, 0, 0, 1, 0, 0);
            const hR = 20;
            const anchor = this.game.view.applyTransformTo(this.x, this.y);
            context.strokeStyle = this.game.colors.highlight;
            context.lineJoin = "round";
            context.lineWidth = hR;
            context.globalAlpha = 0.3;
            context.strokeRect(anchor.x, anchor.y + 1, this.width * this.game.view.scale, this.height * this.game.view.scale);
            context.globalAlpha = 1;
        }
    }

    drawSelected(context) {
        if (this.selected) {
            this.game.ctx.setTransform(1, 0, 0, 1, 0, 0);
            const hR = 20;
            const scaledHR = hR * this.game.view.scale;
            const anchor = this.game.view.applyTransformTo(this.x, this.y);
            context.lineJoin = "miter";
            context.lineWidth = 2;
            context.strokeStyle = "white";
            context.strokeRect(anchor.x - scaledHR, anchor.y - scaledHR, (this.width + hR * 2) * this.game.view.scale, (this.height + hR * 2) * this.game.view.scale);
            context.lineWidth = 2;
            context.setLineDash([2, 2]);
            context.strokeStyle = this.game.colors.select;
            context.strokeRect(anchor.x - scaledHR, anchor.y - scaledHR, (this.width + hR * 2) * this.game.view.scale, (this.height + hR * 2) * this.game.view.scale);
            context.setLineDash([]);
        }
    }

    drawShadow(context, dragging = false) {
        let cR = this.cornerRadius * 2;
        context.lineWidth = cR;
        context.shadowColor = "black"; //"rgba(0,0,0,.5)";

        if(dragging) {
            context.shadowBlur = 40 * this.game.view.scale;
            context.shadowOffsetX = 5 * this.game.view.scale;
            context.shadowOffsetY = 10 * this.game.view.scale;
        }
        else {
            context.shadowBlur = 15 * this.game.view.scale;
            context.shadowOffsetX = 0
            context.shadowOffsetY = 0
        }

        context.strokeRect(this.x + (cR / 2) + 5, this.y + (cR / 2) + 5, this.width - cR - 10, this.height - cR - 10);
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
    }
    

    draw(context) {
        this.drawHighlight(context);

        this.game.view.apply();
        context.fillStyle = "red";
        let cR = this.cornerRadius;
        context.fillStyle = "red";
        context.strokeStyle = "red";
        context.lineJoin = "round";
        context.lineWidth = cR;
        context.strokeRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);
        context.fillRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);
        context.strokeStyle = "white";
        context.lineWidth = 8;
        context.strokeRect(this.x + 15, this.y + 15, this.width - 30, this.height - 30);

        this.game.view.apply();
        context.beginPath();
        context.moveTo(this.x + 15, this.y + 15);
        context.lineTo(this.x + this.width - 15, this.y + this.height - 15);
        context.stroke();

        this.game.view.apply();
        context.beginPath();
        context.moveTo(this.x + 15, this.y + this.height - 15);
        context.lineTo(this.x + this.width - 15, this.y + 15);
        context.stroke();

        this.drawSelected(context);
    }

    isAt(hitX, hitY) {
        const screenPos = this.game.view.toScreen(this.x, this.y);
        const scale = this.game.view.scale;
        const width = this.width * scale;
        const height = this.height * scale;

        return hitX >= screenPos.x & hitX <= screenPos.x + width & hitY >= screenPos.y & hitY <= screenPos.y + height;
    }

    isOverlapping(hitBounds) {
        const screenBounds = { topLeft: this.game.view.toScreen(this.x, this.y), bottomRight: this.game.view.toScreen(this.right, this.bottom) };

        return hitBounds.topLeft.x < screenBounds.bottomRight.x &&
            hitBounds.topLeft.y < screenBounds.bottomRight.y &&
            hitBounds.bottomRight.x > screenBounds.topLeft.x &&
            hitBounds.bottomRight.y > screenBounds.topLeft.y;
    }
} 