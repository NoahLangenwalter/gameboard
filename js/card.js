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
        this.maxTextHeight = this.height * 0.9;
        this.maxTextWidth = this.width * 0.9;

        this.content = content.toString();

        this.animations = {
            flipping: new FlipAnimation(),
            playing: new PlayingAnimation(),
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
                this.y = anim.targetY;
                anim.end();
                this.deck.handleDrawn();
            }
            else {
                this.y = anim.currentY;
                this.x = anim.currentX;
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
        context.strokeStyle = context.fillStyle = this.isFaceUp ? "white" : this.game.colors.dark;
        // context.strokeStyle = this.game.colors.dark;
        context.lineJoin = "round";
        context.lineWidth = cR;
        context.strokeRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);
        context.fillRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);

        if (this.isFaceUp) {
            if (this.isEditing) {

            }
            else {
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
        this.game.ctx.setTransform(1, 0, 0, 1, 0, 0);

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

    formatContent() {
        const context = this.game.ctx;
        const lineHeightMultiplier = 1.25;

        this.fontSize = 200;
        this.font = `${this.fontSize}px ${this.game.font}`;
        context.font = this.font;
        this.lineHeight = context.measureText("M").width * 1.2;
        this.fontTooBig = false;

        this.lines = this.generateLines(context);

        while (this.fontTooBig || this.lines.length * this.lineHeight > this.maxTextHeight) {
            this.fontTooBig = false;
            this.fontSize -= Math.ceil(this.fontSize / 50);
            this.font = `${this.fontSize}px ${this.game.font}`;
            context.font = this.font;

            this.lineHeight = context.measureText("M").width * 1.2;

            this.lines = this.generateLines(context);
        }

        this.lineHeight = this.maxTextHeight / this.lines.length;
    }

    generateLines(context) {
        let wordsInLine = 0;
        const lines = [];
        const charLimit = 10;

        let rawLines = this.#content.split("\n");
        for (let i = 0; i < rawLines.length; i++) {
            let line = "";
            let words = rawLines[i].split(" ");
            for (let j = 0; j < words.length; j++) {
                let word = words[j];

                //break word into two
                if (!this.textFits(context, word) && word.length > charLimit) {
                    const newWord = word.slice(charLimit);
                    words.splice(j + 1, 0, newWord);
                    word = words[j] = word.slice(0, charLimit);
                }

                //still too big? Reduce font
                if (!this.textFits(context, word)) {
                    this.fontTooBig = true;
                    return;
                }

                let testLine = line;
                if (wordsInLine > 0) { testLine += " "; }
                testLine += word;

                if (this.textFits(context, testLine)) {
                    line = testLine;
                    wordsInLine++;
                }
                else {
                    //line would be too wide with added word

                    //if the trial line wasn't that long, trigger a fontSize reduction
                    if (testLine.length < 6) {
                        this.fontTooBig = true;
                        return;
                    }

                    lines.push(line);
                    line = word;
                    wordsInLine = 1;
                }
            }

            if (wordsInLine === 1) {
                let lastWord = line;
                while (lastWord !== null) {
                    lastWord = null;
                    //break last word into two
                    if (!this.textFits(context, line) && line.length > charLimit) {
                        lastWord = line.slice(charLimit);
                        line = word.slice(0, charLimit);
                        lines.push(line);
                        line = lastWord;
                    }

                    //still too big? Reduce font
                    if (!this.textFits(context, line)) {
                        this.fontTooBig = true;
                        return;
                    }
                }
            }

            lines.push(line);
            wordsInLine = 0;
        }

        return lines;
    }

    textFits(context, text, widthMultiplier = 1) {
        let textWidth = context.measureText(text).width * widthMultiplier;
        return textWidth < this.maxTextWidth;
    }

    play = () => {
        this.inDeck = false;
        this.x = this.deck.x;
        this.y = this.deck.y;
        this.z = 1000;
        this.animations.playing.start(this.x, this.y, this.x, this.y + 30 + this.height);
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
        this.animations.flipping.start(this.x, this.width, this.isFaceUp);
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

    start(x, width, isFaceUp) {
        super.start();

        this.x = x;
        this.width = width;
        this.startedFaceUp = isFaceUp;
    }
}

class PlayingAnimation extends AnimationData {
    constructor() {
        super(200);
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

    start(startX, startY, targetX, targetY) {
        super.start();

        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.currentX = this.startX;
        this.currentY = this.startY;
    }
}