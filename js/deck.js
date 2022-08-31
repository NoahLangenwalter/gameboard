import { Card } from './card.js';
import { GameObject } from './gameObject.js';
import { AnimationData } from "./animationData.js";

export class Deck extends GameObject {
    drawInProgress = false;
    empty = true;

    constructor(game, type, numberOfCards, startX = 0, startY = 0, startZ = 0) {
        super(game, startX, startY, startZ);

        this.type = type;
        this.width = 250;
        this.height = 350;
        this.numberOfCards = numberOfCards;

        const iconName = this.type === DeckType.DrawPile ? "deckIcon" : "discardIcon";
        this.icon = document.getElementById(iconName);
        this.isCardTarget = true;
        this.isShuffleable = true;

        this.animations = {
            shuffling: new ShuffleAnimation()
        };

        this.build(numberOfCards);
    }

    get isInteractable() { return !this.drawInProgress && !this.animations.shuffling.status }

    update() {
        if (this.animations.shuffling.status) {
            let anim = this.animations.shuffling;
            anim.update();

            this.cards = anim.cards;
        }
    }

    draw(context) {
        this.drawHighlight(context);

        this.game.view.apply();
        if (this.dragging) {
            let cR = this.cornerRadius * 2;
            context.shadowBlur = 40 * this.game.view.scale;
            context.shadowOffsetX = 5 * this.game.view.scale;
            context.shadowOffsetY = 10 * this.game.view.scale;
            context.lineWidth = cR;
            context.shadowColor = "black";
            context.strokeRect(this.x + (cR / 2) + 5, this.y + (cR / 2) + 5, this.width - cR - 10, this.height - cR - 10);
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
        }
        if (this.empty) {
            if (this.type === DeckType.DrawPile) {
                this.drawAsDrawPile(context);
            }
            else {
                this.drawAsDiscardPile(context);
            }
        }
        else {
            if (this.animations.shuffling.status) {
                const anim = this.animations.shuffling;

                for (let i = this.cards.length - 1; i > -1; i--) {
                    this.cards[i].draw(context);
                }
            }
            else {
                this.cards[0].draw(context);
            }
        }

        this.drawSelected(context);

        // deck icon overlay
        this.game.ctx.setTransform(1, 0, 0, 1, 0, 0);
        let radius = 21 - (.5 / this.game.view.scale);
        const center = this.game.view.applyTransformTo(this.right - radius, this.bottom - radius);
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'white';
        context.fill();
        context.lineWidth = 5 - (.2 / this.game.view.scale)
        context.strokeStyle = "black";
        context.stroke();

        let iconSize = radius * 1.25;
        context.drawImage(this.icon, center.x - iconSize / 2, center.y - iconSize / 2, iconSize, iconSize);
    }

    drawAsDrawPile(context) {
        let cR = this.cornerRadius;
        context.fillStyle = this.game.colors.medium;//"#4a6f71";
        context.strokeStyle = this.game.colors.medium;//"#4a6f71";
        // context.fillRect(this.x, this.y, this.width, this.height);
        context.lineJoin = "round";
        context.lineWidth = cR;
        context.strokeRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);
        context.fillRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);

        context.strokeStyle = "black";
        context.lineWidth = 15;
        context.beginPath();
        context.moveTo(this.x + 60, this.y + 120);
        context.lineTo(this.x + this.width - 60, this.y + this.height - 120);
        context.stroke();
        context.beginPath();
        context.moveTo(this.x + 60, this.y + this.height - 120);
        context.lineTo(this.x + this.width - 60, this.y + 120);
        context.stroke();
    }

    drawAsDiscardPile(context) {
        let cR = this.cornerRadius;
        context.fillStyle = this.game.colors.medium;//"#4a6f71";
        context.strokeStyle = this.game.colors.medium;//"#4a6f71";
        // context.fillRect(this.x, this.y, this.width, this.height);
        context.lineJoin = "round";
        context.lineWidth = cR;
        context.strokeRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);
        context.fillRect(this.x + (cR / 2), this.y + (cR / 2), this.width - cR, this.height - cR);

        context.strokeStyle = "black";
        context.lineWidth = 15;
        let radius = 60;
        const center = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
        context.stroke();
    }

    activate() {
        this.drawCard();
    }

    shuffle = () => {
        if (this.cards.length > 1) {
            this.animations.shuffling.start(this.x, this.y, this.cards);
        }
    }

    drawCard = () => {
        if (this.cards.length > 0) {
            let drawn = this.cards.shift();

            this.game.addObject(drawn);
            drawn.play();
            if (this.type === DeckType.DrawPile) {
                drawn.flip();
            }

            this.drawInProgress = true;
        }

        if (this.cards.length === 0) {
            this.empty = true;
        }
    }

    returnCard = (card) => {
        card.addToDeck(this);
        //adds to top;
        this.cards.unshift(card);
        this.game.removeObject(card);
        this.game.deselectObject(card);

        this.empty = this.cards.length === 0;
    }

    build = (numberOfCards) => {
        this.cards = [];

        for (let i = 1; i < numberOfCards + 1; i++) {
            this.returnCard(new Card(this.game, i));
        }

        this.shuffle();

        this.empty = numberOfCards === 0;
    }

    handleDrawn = () => {
        this.drawInProgress = false;
    }
}

export const DeckType = {
    DrawPile: 'DrawPile',
    DiscardPile: 'DiscardPile',
    Stack: 'Stack',
};

class ShuffleAnimation extends AnimationData {
    constructor() {
        super(-1);
        this.gravity = 1;
        this.startSpeed = 10;
    }
    update() {
        if (this.speed < 0) {
            this.cards = this.shuffledCards;
        }

        let returned = 0;
        for (let i = 0; i < this._cards.length; i++) {
            const card = this._cards[i];
            const vector = this.cardVectors[i];

            if (this.speed > 0 ||
                (Math.sign(card.x - this.deckX) == Math.sign(vector.x)
                    && Math.sign(card.y - this.deckY) == Math.sign(vector.y)
                )
            ) {
                card.x += this.cardVectors[i].x * this.speed;
                card.y += this.cardVectors[i].y * this.speed;
            }
            else {
                card.x = this.deckX;
                card.y = this.deckY;
                returned++;
            }
        }

        this.speed -= this.gravity;

        if (returned === this._cards.length) {
            this.end();
        }
    }

    start(deckX, deckY, cards) {
        super.start();

        this.speed = this.startSpeed;

        this.deckX = deckX;
        this.deckY = deckY;
        this._cards = cards;
        this.cards = cards;
        this.topCard = cards[0];

        this.shuffledCards = [...cards];
        this.#shuffle();
        this.newTopCard = this.shuffledCards[0];

        this.cardVectors = [];
        this._cards.forEach(card => {
            card.shuffling = true;
            card.x = this.deckX;
            card.y = this.deckY;
            const x = (Math.random() * 1.5 - .75);
            const y = (Math.random() * 2 - 1);
            this.cardVectors.push({ x, y });
        });

        this.cardVectors[0].y = 3;
        if (this.topCard !== this.newTopCard) {
            const topVector = this.cardVectors[0];
            const newI = this._cards.indexOf(this.newTopCard);
            this.cardVectors[newI] = { x: -topVector.x, y: -topVector.y };
        }
    }

    end() {
        super.end();

        this._cards.forEach(card => {
            card.shuffling = false;
        });
    }

    #shuffle() {
        //pilfered from https://bost.ocks.org/mike/shuffle/
        var m = this.shuffledCards.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = this.shuffledCards[m];
            this.shuffledCards[m] = this.shuffledCards[i];
            this.shuffledCards[i] = t;
        }
    }
}