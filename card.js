import { GameObject } from "./gameObject.js";
import { AnimationData } from "./animationData.js";
import { DeckType } from "./deck.js";

export class Card extends GameObject {
    isFaceUp = true;
    isEditing = false
    deck = null;
    #content = "";

    constructor(game, content = "", startX = 0, startY = 0, startZ = 0) {
        super(game, startX, startY, startZ);

        this.width = 250;
        this.height = 350;
        this.maxTextHeight = this.height * 0.8;
        this.maxTextWidth = this.width * 0.8;

        this.#content = content.toString();
        this.formatContent();

        this.animations = {
            flipping: new FlipAnimation(),
            playing: new AnimationData(200),
        }
        this.isEditable = true;
    }

    get x() {
        return this.inDeck ? this.deck.x : this._x;
    }
    get y() {
        return this.inDeck ? this.deck.y : this._y;
    }
    get z() {
        return this.inDeck ? this.deck.z : this._z;
    }
    set x(v) { this._x = v }
    set y(v) { this._y = v }
    set z(v) { this._z = v }
    get isInteractable() {
        return !this.animations.flipping.status & !this.animations.playing.status;
    }
    get content() { return this.#content; }
    set content(val) {
        this.#content = val;
        this.formatContent();
    }
    get lineCount() { return this.lines.length }

    update() {
        if (this.animations.playing.status) {
            let anim = this.animations.playing;
            anim.update();

            if (anim.elapsed >= anim.duration) {
                this.y = anim.targetValues[1];
                anim.end();
                this.deck.handleDrawn();
            }
            else {
                let diffY = anim.targetValues[1] - anim.startValues[1];
                let plusY = diffY * anim.elapsedPercent;
                this.y = anim.startValues[1] + plusY;
            }
        }
        if (this.animations.flipping.status) {
            let anim = this.animations.flipping;
            anim.update();

            this.isFaceUp = anim.isFaceUp;

            if (anim.elapsed >= anim.duration) {
                anim.end();
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
        let cR = this.cornerRadius * 2;
        if (this.dragging || this.animations.playing.status) {
            context.shadowBlur = 40 * this.game.view.scale;
            context.shadowOffsetX = 5 * this.game.view.scale;
            context.shadowOffsetY = 10 * this.game.view.scale;
        }
        else {
            context.shadowBlur = 15 * this.game.view.scale;
            context.shadowOffsetX = 0
            context.shadowOffsetY = 0
        }
        context.lineWidth = cR;
        context.shadowColor = "black";
        context.strokeRect(this.x + (cR / 2) + 5, this.y + (cR / 2) + 5, this.width - cR - 10, this.height - cR - 10);
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        cR = this.cornerRadius;
        context.fillStyle = this.isFaceUp ? "white" : this.game.colors.dark;
        context.strokeStyle = this.game.colors.dark;
        context.lineJoin = "round";
        context.lineWidth = cR;
        context.strokeRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);
        context.fillRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);
        context.strokeStyle = this.isFaceUp ? "white" : this.game.colors.light;
        context.lineWidth = 8;
        context.strokeRect(this.x + 15, this.y + 15, this.width - 30, this.height - 30);

        if (this.isFaceUp) {
            if (this.isEditing) {

            }
            else {
                this.drawContent(context);
            }
        }
        else {
            //Draw card back
            context.beginPath();
            context.moveTo(this.x + 15, this.y + 15);
            context.lineTo(this.x + this.width - 15, this.y + this.height - 15);
            context.stroke();

            context.beginPath();
            context.moveTo(this.x + 15, this.y + this.height - 15);
            context.lineTo(this.x + this.width - 15, this.y + 15);
            context.stroke();
        }
        context.transform(1, 0, 0, 1, 0, 0);
        this.game.ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.drawSelected(context);
    }

    drawContent(context) {
        context.fillStyle = this.isEditing ? "red" : "black";
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.font = this.font;

        let currentYOffset = -(this.lines.length * this.lineHeight) / 2;// + (this.linehight /2);
        for (let i = 0; i < this.lines.length; i++) {
            context.fillText(this.lines[i], this.x + this.width / 2, this.y + this.height / 2 + currentYOffset + this.lineHeight / 2);
            currentYOffset += this.lineHeight;
        }
    }

    formatContent() {
        const context = this.game.ctx;

        this.fontSize = 100
        this.font = `${this.fontSize}px Arial`;
        context.font = this.font;
        this.lineHeight = context.measureText("M").width;

        this.lines = this.generateLines(context);

        while (this.lines.length * this.lineHeight > this.maxTextHeight) {
            this.fontSize--;
            this.font = `${this.fontSize}px Arial`;
            context.font = this.font;

            this.lineHeight = context.measureText("M").width;

            this.lines = this.generateLines(context);
        }
    }

    generateLines(context) {
        let words = this.#content.replace(/\n/g, " **NEWLINE** ")
        words = words.split(" ");
        let line = "";
        let wordsInLine = 0;
        const lines = [];

        for (let i = 0; i < words.length; i++) {
            let wordWidth = context.measureText(words[i]).width;
            if (wordWidth > this.maxTextWidth && words[i].length > 15) {
                words.splice(i + 1, 0, words[i].slice(15));
                words[i] = words[i].slice(0, 15) + "-";
            }

            wordWidth = context.measureText(words[i]).width;
            if (wordWidth > this.maxTextWidth) {
                this.lineHeight = 1000;
                break;
            }

            let testLine = line;
            if (wordsInLine > 0) { testLine += " "; }
            testLine += words[i];

            let test = context.measureText(testLine);
            if ((words[i] == "**NEWLINE**" || test.width > this.maxTextWidth) && i > 0) {
                lines.push(line);

                if (words[i] == "**NEWLINE**") {
                    // lines.push("");
                    line = "";
                    wordsInLine = 0;
                }
                else if (testLine.length < 7) {
                    this.lineHeight = 1000;
                    break;
                }
                else {
                    line = words[i];
                    wordsInLine = 1;
                }
            }
            else {
                line = testLine;
                wordsInLine++;
            }
        }
        lines.push(line);

        return lines;
    }


    play = () => {
        this.inDeck = false;
        this.x = this.deck.x;
        this.y = this.deck.y;
        this.z = 1000;
        this.animations.playing.start([this.x, this.y], [this.x, this.y + 30 + this.height]);
    }

    addToDeck = (deck) => {
        this.inDeck = true;
        this.deck = deck;
        this.x = this.deck.x;
        this.y = this.deck.y;
        this.isFaceUp = this.deck.type !== DeckType.DrawPile;
        //TODO: should this animate? the flipping and moving to the deck's position?
    }

    activate() {
        this.flip();
    }

    flip = () => {
        this.animations.flipping.start([this.x, this.width, this.isFaceUp]);
    }

    startEdit() {
        this.isEditing = true;
    }

    endEdit() {
        this.isEditing = false;
    }
}

class FlipAnimation extends AnimationData {
    constructor() {
        super(150);
        this.matrix = [1, 0, 0, 1, 0, 0];
    }
    update() {
        super.update();

        if (this.elapsedPercent > .5) {
            this.isFaceUp = !this.startedFaceUp;
        }

        this.matrix[0] = Math.abs(this.elapsedPercent * 2 - 1);
        this.matrix[1] = 0;//.25 * (1 - this.matrix[0]);
        this.matrix[3] = 1;
        this.matrix[4] = (this.x + this.width / 2) * (1 - this.matrix[0]);
    }

    start(startValues, targetValues = null) {
        super.start(startValues, targetValues);

        this.x = startValues[0];
        this.width = startValues[1];
        this.startedFaceUp = startValues[2];
    }
}