import { GameObject } from "./gameObject.js";
import { AnimationData } from "./animationData.js";
import { Text } from "./text.js";

export class Note extends GameObject {
    isEditing = false
    #content = "";
    moving = false;

    constructor(game, content = "", width = 300, height = 300, startX = 0, startY = 0, startZ = 0) {
        super(game, startX, startY, startZ);

        this.width = width;
        this.height = height;
        this.maxTextHeight = Math.floor(this.height * 0.85);
        this.maxTextWidth = Math.floor(this.width * 0.85);

        this.content = content.toString();

        this.isEditable = true;
        this.isFlippable = false;

        this.cornerRadius = 2;
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

    get isInteractable() {
        return true;
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

    }

    draw(context) {
        this.drawHighlight(context);

        this.game.view.apply();

        this.drawShadow(context, this.dragging);

        let cR = this.cornerRadius;
        context.strokeStyle = context.fillStyle = "#ffe27a";
        context.lineJoin = "round";
        context.lineWidth = cR;
        context.strokeRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);
        context.fillRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);

        if (!this.isEditing) {
            this.drawContent(context);
        }

        context.transform(1, 0, 0, 1, 0, 0);

        this.drawSelected(context);
    }

    drawContent(context) {
        context.fillStyle = "black";
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.font = this.font;

        let currentYOffset = -(this.lines.length * this.lineHeight) / 2;
        for (let i = 0; i < this.lines.length; i++) {
            context.fillText(this.lines[i], this.x + this.width / 2, this.y + this.height / 2 + currentYOffset + this.lineHeight / 2);
            currentYOffset += this.lineHeight;
        }
    }

    startEdit() {
        this.isEditing = true;
    }

    endEdit() {
        this.isEditing = false;
    }

    static serializableProperties = ["isFaceUp", "content", "width", "height", "maxTextHeight", "maxTextWidth"];
    serialize() {
        const propsToSerialize = [...GameObject.serializableProperties, ...Note.serializableProperties];
        return JSON.stringify(this, propsToSerialize, 0);
    }
}