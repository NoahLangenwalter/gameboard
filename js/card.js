import { GameObject } from "./gameObject.js";
import { AnimationData } from "./animationData.js";
import { Text } from "./text.js";

export class Card extends GameObject {
    isEditing = false
    deck = null;
    #content = "";
    #isFaceUp = true;
    moving = false;

    constructor(game, content = "", isFaceUp = true, startX = 0, startY = 0, startZ = 0) {
        super(game, startX, startY, startZ);

        this.isFaceUp = isFaceUp;
        this.width = 250;
        this.height = 350;
        this.maxTextHeight = Math.floor(this.height * 0.85);
        this.maxTextWidth = Math.floor(this.width * 0.85);

        this.content = content.toString();

        this.animations = {
            flipping: new FlipAnimation(),
            moving: new MovingAnimation(),
        }
        this.isEditable = true;
        this.cardBack = document.getElementById("cardBack");
    }

    get x() {
        return this.inDeck && !this.shuffling ? this.deck.x : this._x;
    }
    get y() {
        return this.inDeck && !this.shuffling ? this.deck.y : this._y;
    }
    get z() {
        return this.inDeck && !this.shuffling ? this.deck.z : this._z;
    }
    set x(v) { this._x = v }
    set y(v) { this._y = v }
    set z(v) { this._z = v }
    get isFaceUp() {
        return this.inDeck ? this.deck.isFaceUp : this.#isFaceUp;
    }
    set isFaceUp(v) { this.#isFaceUp = v }
    get isInteractable() {
        return !this.animations.flipping.status
            && !this.animations.moving.status
            && !this.moving;
    }
    get content() { return this.#content; }
    set content(val) {
        this.#content = val;

        const formatted = Text.formatContent(this.game.ctx, val, this.game.font, this.maxTextWidth, this.maxTextHeight);
        this.fontSize = formatted.fontSize;
        this.lineHeight = formatted.lineHeight;
        this.lines = formatted.lines;
        this.font = `${formatted.fontSize}px ${this.game.font}`;
    }
    get lineCount() { return this.lines.length }

    update() {
        if (this.animations.flipping.status) {
            let anim = this.animations.flipping;
            anim.update();

            if (anim.elapsed >= anim.duration) {
                anim.end();
            }
        }

        if (this.animations.moving.status) {
            let anim = this.animations.moving;
            anim.update();

            if (anim.elapsed >= anim.duration) {
                this.x = anim.targetX;
                this.y = anim.targetY;
                anim.end();
                if (anim.intoDeck) {
                    this.deck.handleReturn(this);
                }
                else {
                    this.deck.handleDrawn();
                }
            }
            else {
                this.y = anim.currentY;
                this.x = anim.currentX;
            }
        }
    }

    draw(context) {
        this.drawHighlight(context);

        this.game.view.apply();
        if (this.animations.flipping.status) {
            let anim = this.animations.flipping;
            context.transform(...anim.matrix);
        }

        this.drawShadow(context, this.dragging || this.animations.moving.status || this.animations.flipping.status);

        let cR = this.cornerRadius;
        context.strokeStyle = context.fillStyle = this.isFaceUp ? "white" : this.game.colors.dark;
        context.lineJoin = "round";
        context.lineWidth = cR;
        context.strokeRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);
        context.fillRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);

        if (this.isFaceUp) {
            if (!this.isEditing) {
                this.drawContent(context);
            }
        }
        else {
            this.drawCardBack(context);
        }

        //draw border
        const radius = 12;
        context.beginPath();
        context.lineWidth = "1";
        context.strokeStyle = this.game.colors.dark;
        context.moveTo(this.x + radius, this.y);
        context.lineTo(this.right - radius, this.y);
        context.quadraticCurveTo(this.right, this.y, this.right, this.y + radius);
        context.lineTo(this.right, this.y + this.height - radius);
        context.quadraticCurveTo(this.right, this.bottom, this.right - radius, this.bottom);
        context.lineTo(this.x + radius, this.bottom);
        context.quadraticCurveTo(this.x, this.bottom, this.x, this.bottom - radius);
        context.lineTo(this.x, this.y + radius);
        context.quadraticCurveTo(this.x, this.y, this.x + radius, this.y);
        context.stroke();

        context.transform(1, 0, 0, 1, 0, 0);

        this.drawSelected(context);
    }

    drawCardBack(context) {
        const radius = 12;
        context.save();
        context.beginPath();
        context.lineWidth = "1";
        context.moveTo(this.x + radius, this.y);
        context.lineTo(this.right - radius, this.y);
        context.quadraticCurveTo(this.right, this.y, this.right, this.y + radius);
        context.lineTo(this.right, this.y + this.height - radius);
        context.quadraticCurveTo(this.right, this.bottom, this.right - radius, this.bottom);
        context.lineTo(this.x + radius, this.bottom);
        context.quadraticCurveTo(this.x, this.bottom, this.x, this.bottom - radius);
        context.lineTo(this.x, this.y + radius);
        context.quadraticCurveTo(this.x, this.y, this.x + radius, this.y);
        context.clip();

        context.drawImage(this.cardBack, this.x, this.y, this.width, this.height);

        context.restore();
    }

    drawContent(context) {
        context.fillStyle = this.isEditing ? "red" : "black";
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.font = this.font;

        let currentYOffset = -(this.lines.length * this.lineHeight) / 2;
        for (let i = 0; i < this.lines.length; i++) {
            context.fillText(this.lines[i], this.x + this.width / 2, this.y + this.height / 2 + currentYOffset + this.lineHeight / 2);
            currentYOffset += this.lineHeight;
        }
    }

    play = (targetPosition = null, animate = true) => {
        if (targetPosition === null) {
            targetPosition = { x: this.x, y: this.y + 30 + this.height };
        }

        this.inDeck = false;
        this.x = this.deck.x;
        this.y = this.deck.y;
        this.z = this.game.nextZ + 1000;

        if (animate) {
            this.animations.moving.start(150, this.x, this.y, targetPosition.x, targetPosition.y);
        }
        else {
            this.x = targetPosition.x;
            this.y = targetPosition.y;
            this.deck.handleDrawn();
        }
    }

    addToDeck = (deck, delay = 0, animate = true) => {
        this.moving = true;

        this.game.deselectObject(this);
        this.deck = deck;

        if (animate) {
            setTimeout(() => {
                this.animations.moving.start(250, this._x, this._y, this.deck.x, this.deck.y, true);

                this.x = this.deck.x;
                this.y = this.deck.y;
                if (this.isFaceUp !== this.deck.isFaceUp) {
                    this.flip();
                }
            }, delay);
        }
        else {
            this.x = this.deck.x;
            this.y = this.deck.y;
            this.isFaceUp = this.deck.isFaceUp
            this.moving = false;
            this.inDeck = true;
        }
    }

    activate() {
        this.flip();
    }

    flip = () => {
        this.animations.flipping.start(this, this.width, this.isFaceUp);
    }

    startEdit() {
        this.isEditing = true;
    }

    endEdit() {
        this.isEditing = false;
    }

    handleFlipMidpoint(isFaceUp) {
        this.isFaceUp = isFaceUp;
    }

    static serializableProperties = ["isFaceUp", "content"];
    serialize() {
        const propsToSerialize = [...GameObject.serializableProperties, ...Card.serializableProperties];
        return JSON.stringify(this, propsToSerialize, 0);
    }
}

export class FlipAnimation extends AnimationData {
    constructor(duration = 150) {
        super(duration);
        this.matrix = [1, 0, 0, 1, 0, 0];
    }
    update() {
        super.update();

        if (this.elapsedPercent > .5) {
            this.isFaceUp = !this.startedFaceUp;

            if (!this.flipped) {
                this.flipped = true;
                this.obj.handleFlipMidpoint(this.isFaceUp);
            }
        }

        this.matrix[0] = Math.abs(this.elapsedPercent * 2 - 1);
        this.matrix[1] = 0;
        this.matrix[3] = 1;
        this.matrix[4] = (this.obj.x + this.width / 2) * (1 - this.matrix[0]);
    }

    start(obj, width, isFaceUp) {
        super.start();

        this.flipped = false;
        this.obj = obj;
        this.width = width;
        this.startedFaceUp = isFaceUp;
    }
}

class MovingAnimation extends AnimationData {
    constructor() {
        super(-1);
    }
    update() {
        super.update();

        let diffY = this.targetY - this.startY;
        let plusY = diffY * this.elapsedPercent;
        this.currentY = this.startY + plusY;

        let diffX = this.targetX - this.startX;
        let plusX = diffX * this.elapsedPercent;
        this.currentX = this.startX + plusX;
    }

    start(duration, startX, startY, targetX, targetY, intoDeck = false) {
        super.start();
        this._duration = duration;

        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.currentX = this.startX;
        this.currentY = this.startY;
        this.intoDeck = intoDeck;
    }

    end() {
        super.end();
    }
}