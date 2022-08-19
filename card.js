import { GameObject } from "./gameObject.js";
import { AnimationData } from "./animationData.js";
import { DeckType } from "./deck.js";

export class Card extends GameObject {
    isFaceUp = false;
    drawing = false;

    flipping = false;
    playing = false;
    constructor(game, deck=null, number, drawnHandler=null, startX = 0, startY = 0, startZ = 0) {
        super(game, number, startX, startY, startZ);

        this.deck = deck;
        this.inDeck = deck !== null;
        if(this.inDeck) {
            this.x = deck.x;
            this.y = deck.y;
        }
        this.width = 250;
        this.height = 350;

        this.number = number;
        this.drawnHandler = drawnHandler;

        this.animations = {
            flipping: new FlipAnimation(),
            playing: new AnimationData(200),
        }
    }

    get pos() {
        if (this.inDeck) {
            return { x: this.deck.x, y: this.deck.y };
        }
        else {
            return { x: this.x, y: this.y };
        }
    }

    update() {
        if (this.animations.playing.status) {
            let anim = this.animations.playing;
            anim.update();

            if (anim.elapsed >= anim.duration) {
                this.y = anim.targetValues[1];
                anim.end();
                this.drawnHandler();
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

            if (anim.elapsed > anim.duration) {
                anim.end();
            }
        }
    }

    draw(context) {
        if (this.hovering) {
            this.game.ctx.setTransform(1, 0, 0, 1, 0, 0);
            const hR = 20;
            const anchor = this.game.view.applyTransformTo(this.pos.x, this.pos.y);
            context.strokeStyle = this.game.colors.highlight;
            context.lineWidth = hR;
            context.globalAlpha = 0.5;
            context.strokeRect(anchor.x, anchor.y + 1, this.width * this.game.view.scale, this.height * this.game.view.scale);
            context.globalAlpha = 1;
        }

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
        context.strokeRect(this.pos.x + (cR / 2) + 5, this.pos.y + (cR / 2) + 5, this.width - cR - 10, this.height - cR - 10);
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        cR = this.cornerRadius;
        context.fillStyle = this.isFaceUp ? "white" : this.game.colors.dark;
        context.strokeStyle = this.game.colors.dark;
        context.lineJoin = "round";
        context.lineWidth = cR;
        context.strokeRect(this.pos.x + (cR / 2), this.pos.y + (cR / 2), this.width - cR, this.height - cR);
        context.fillRect(this.pos.x + (cR / 2), this.pos.y + (cR / 2), this.width - cR, this.height - cR);
        context.strokeStyle = this.isFaceUp ? "white" : this.game.colors.light;
        context.lineWidth = 8;
        context.strokeRect(this.pos.x + 15, this.pos.y + 15, this.width - 30, this.height - 30);

        if (this.isFaceUp) {
            context.fillStyle = "black";
            context.font = "100px Arial";
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.fillText(this.number, this.pos.x + this.width / 2, this.pos.y + this.height / 2);
        }
        else {
            context.beginPath();
            context.moveTo(this.pos.x + 15, this.pos.y + 15);
            context.lineTo(this.pos.x + this.width - 15, this.pos.y + this.height - 15);
            context.stroke();

            context.beginPath();
            context.moveTo(this.pos.x + 15, this.pos.y + this.height - 15);
            context.lineTo(this.pos.x + this.width - 15, this.pos.y + 15);
            context.stroke();
        }
        context.transform(1, 0, 0, 1, 0, 0);
        this.game.ctx.setTransform(1, 0, 0, 1, 0, 0);
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
        this.animations.flipping.start([this.pos.x, this.width, this.isFaceUp]);
    }
}

class FlipAnimation extends AnimationData {
    constructor() {
        super(200);
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
        this.matrix[4] = (this.x + this.width/2) * (1 - this.matrix[0]);
    }

    start(startValues, targetValues = null) {
        super.start(startValues, targetValues);

        this.x = startValues[0];
        this.width = startValues[1];
        this.startedFaceUp = startValues[2];
    }
}