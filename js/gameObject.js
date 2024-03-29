export class GameObject {
    width = 100;
    height = 100;
    cornerRadius = 20;
    dragging = false;
    hovering = false;
    selected = false;
    isCardTarget = false;
    isEditable = false;
    isRandomizable = false;
    isFlippable = false;

    constructor(game, startX = 0, startY = 0, startZ = -1) {
        this.className = this.constructor.name;
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
    get center() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

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
            context.setTransform(1, 0, 0, 1, 0, 0);
            const hR = 20;
            context.strokeStyle = this.game.colors.highlight;
            context.lineJoin = "round";
            context.lineWidth = hR;
            context.globalAlpha = 0.3;
            const center = this.game.view.applyTransformTo(this.center.x, this.center.y);
            const scale = this.game.view.scale;

            if (this.radius) {
                context.beginPath();
                context.arc(center.x, center.y + 1, this.radius * scale, 0, 2 * Math.PI, false);
                context.stroke();
            }
            else if (this.points) {
                context.beginPath();

                const last = this.points[this.points.length - 1];
                context.moveTo(center.x + last.x * scale, center.y + last.y * scale);
                for (let i = 0; i < this.points.length; i++) {
                    const point = this.points[i];

                    context.lineTo(center.x + point.x * scale, center.y + point.y * scale);
                }

                context.closePath();
                context.stroke();
            }
            else {
                const anchor = this.game.view.applyTransformTo(this.x, this.y);
                context.strokeRect(anchor.x, anchor.y + 1, this.width * scale, this.height * scale);
            }

            context.globalAlpha = 1;
        }
    }

    drawSelected(context) {
        if (this.selected) {
            context.setTransform(1, 0, 0, 1, 0, 0);
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
        context.shadowColor = "black";
        context.strokeStyle = "black";
        context.lineJoin = "round";

        if (dragging) {
            //TODO: Performance - don't use shadowBlur
            context.shadowBlur = 40 * this.game.view.scale;
            context.shadowOffsetX = 5 * this.game.view.scale;
            context.shadowOffsetY = 10 * this.game.view.scale;
        }
        else {
            context.shadowBlur = 15 * this.game.view.scale;
            context.shadowOffsetX = 0
            context.shadowOffsetY = 0
        }

        context.strokeRect(this.x + (cR / 2) + 7, this.y + (cR / 2) + 7, this.width - cR - 14, this.height - cR - 14);
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
        const scale = this.game.view.scale;

        if (this.radius) {
            const center = this.game.view.toScreen(this.center.x, this.center.y);
            const distanceFromCenter = Math.sqrt(Math.pow(hitX - center.x, 2) + Math.pow(hitY - center.y, 2));
            return distanceFromCenter < this.radius;
        }
        else {
            const screenPos = this.game.view.toScreen(this.x, this.y);
            const width = this.width * scale;
            const height = this.height * scale;

            return hitX >= screenPos.x & hitX <= screenPos.x + width & hitY >= screenPos.y & hitY <= screenPos.y + height;
        }
    }

    isOverlapping(hitBounds) {
        const screenBounds = { topLeft: this.game.view.toScreen(this.x, this.y), bottomRight: this.game.view.toScreen(this.right, this.bottom) };

        // if(this.radius) {
        //     const center = this.game.view.toScreen(this.center.x, this.center.y);

        //     const centerWithinBounds = center.x >= screenBounds.topLeft.x & center.x <= screenBounds.bottomRight.x & center.y >= screenBounds.topLeft.y & center.y <= screenBounds.bottomRight.y;
        //     if(centerWithinBounds) { 
        //         return true;
        //     }

        //     const distanceFromCenter = Math.sqrt(Math.pow(hitX - center.x, 2) + Math.pow(hitY - center.y, 2));
        //     return distanceFromCenter < this.radius;
        // }
        // else {
        return hitBounds.topLeft.x < screenBounds.bottomRight.x &&
            hitBounds.topLeft.y < screenBounds.bottomRight.y &&
            hitBounds.bottomRight.x > screenBounds.topLeft.x &&
            hitBounds.bottomRight.y > screenBounds.topLeft.y;
    }

    static serializableProperties = ["className", "x", "y", "z"];
    serialize() {
        return JSON.stringify(this, GameObject.serializableProperties, 0);
    }

    deserialize(object) {
        Object.assign(this, object);
    }
}