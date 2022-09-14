import { Card, FlipAnimation } from './card.js';
import { GameObject } from './gameObject.js';
import { AnimationData } from "./animationData.js";

export class Deck extends GameObject {
    isFaceUp = false;
    drawInProgress = false;
    returnsInProgress = 0;
    returningCards = [];
    empty = true;

    constructor(game, isFaceUp, numberOfCards, startX = 0, startY = 0, startZ = 0) {
        super(game, startX, startY, startZ);

        this.isFaceUp = isFaceUp;
        this.width = 250;
        this.height = 350;
        this.numberOfCards = numberOfCards;

        this.faceUpIcon = document.getElementById("faceUpIcon");
        this.faceDownIcon = document.getElementById("faceDownIcon");
        this.isCardTarget = true;
        this.isShuffleable = true;

        this.animations = {
            flipping: new FlipAnimation(150),
            shuffling: new ShuffleAnimation()
        };

        this.build(numberOfCards);
    }

    get isInteractable() {
        return !this.drawInProgress
            && this.returnsInProgress === 0
            && !this.animations.flipping.status
            && !this.animations.shuffling.status
    }

    get isEmpty() {
        return this.empty;
    }

    update() {
        if (this.animations.flipping.status) {
            let anim = this.animations.flipping;
            anim.update();

            if (anim.elapsed >= anim.duration) {
                anim.end();
            }
        }

        if (this.animations.shuffling.status) {
            let anim = this.animations.shuffling;
            anim.update();

            this.cards = anim.cards;
        }

        if (!this.empty && this.flipper) {
            this.flipper.update();
        }
    }

    draw(context) {
        this.drawHighlight(context);

        this.game.view.apply();
        if (this.animations.flipping.status) {
            let anim = this.animations.flipping;
            context.transform(...anim.matrix);
        }

        if (this.dragging) {
            this.drawShadow(context, true);
        }
        if (this.empty) {
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

            if (this.isFaceUp) {
                context.strokeStyle = "black";
                context.lineWidth = 15;
                let radius = 60;
                const center = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
                context.beginPath();
                context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
                context.stroke();
            }
            else {
                context.beginPath();
                context.moveTo(this.x + 60, this.y + 120);
                context.lineTo(this.x + this.width - 60, this.y + this.height - 120);
                context.stroke();
                context.beginPath();
                context.moveTo(this.x + 60, this.y + this.height - 120);
                context.lineTo(this.x + this.width - 60, this.y + 120);
                context.stroke();
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
        context.setTransform(1, 0, 0, 1, 0, 0);
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
        const icon = this.isFaceUp ? this.faceUpIcon : this.faceDownIcon;
        context.drawImage(icon, center.x - iconSize / 2, center.y - iconSize / 2, iconSize, iconSize);
    }

    activate() {
        this.drawCard();
    }

    drawCardTo(targetPosition, targetObj = null) {

        if(targetObj !== null && targetObj.isCardTarget) {
            const center = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            const card = this.drawCard(center, false, false);

            targetObj.returnCards([card]);
        }
        else {
            this.drawCard(targetPosition);
        }
    }

    shuffle = () => {
        if (this.cards.length > 1) {
            this.animations.shuffling.start(this.x, this.y, this.cards);
        }
    }

    flip = () => {
        if (!this.empty) {
            this.flipper = this.cards[0];
            this.flipper.flip();
        }
        this.animations.flipping.start(this, this.width, this.isFaceUp);
    }

    drawCard = (targetPosition = null, flip = false, animate = true) => {
        let drawn = null;

        if (this.cards.length > 0) {
            if(targetPosition !== null) {
                targetPosition.x -= this.width / 2;
                targetPosition.y -= this.height / 2;
            }

            drawn = this.cards.shift();
            drawn.isFaceUp = this.isFaceUp;
            if (flip) {
                drawn.isFaceUp = !drawn.isFaceUp;
            }

            this.game.addObject(drawn);
            this.drawInProgress = true;
            drawn.play(targetPosition, animate);
        }

        if (this.cards.length === 0) {
            this.empty = true;
        }
        
        return drawn;
    }

    returnCard = (card, offset = 0) => {
        this.returnsInProgress++;
        card.addToDeck(this, offset);
    }

    returnCards = (cards) => {
        this.returningCards = cards;
        this.returningCards.sort(this.game.sortByZ);

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            this.returnCard(card, (cards.length - i) * 10);
        }
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

    handleReturn = (card) => {
        this.returnsInProgress--;

        if (this.returnsInProgress === 0) {
            this.returningCards.forEach(card => {
                //adds to top;
                card.inDeck = true;
                this.cards.unshift(card);
                this.game.removeObject(card);
                this.game.deselectObject(card);
            });

            this.empty = this.cards.length === 0;
        }
    }

    handleFlipMidpoint(isFaceUp) {
        this.isFaceUp = isFaceUp;
        this.cards.reverse();
    }
}

class ShuffleAnimation extends AnimationData {
    constructor() {
        super(-1);
        this.gravity = 2;
        this.startSpeed = 15;
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
        let opposedCard = this.newTopCard;
        if (this.topCard === this.newTopCard) {
            opposedCard = this.shuffledCards[1];
        }

        const topVector = this.cardVectors[0];
        const newI = this._cards.indexOf(opposedCard);
        this.cardVectors[newI] = { x: -topVector.x, y: -topVector.y };
    }

    end() {
        super.end();

        this._cards.forEach(card => {
            card.shuffling = false;
            card.animations.flipping.end();
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