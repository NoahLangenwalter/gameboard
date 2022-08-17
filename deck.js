import { Card } from './card.js';
import { GameObject } from './gameObject.js';

export class Deck extends GameObject {
    drawInProgress = false;

    constructor(game, numberOfCards, startX = 0, startY = 0, startZ = 0) {
        super(game, startX, startY, startZ);

        this.width = 250;
        this.height = 350;
        this.numberOfCards = numberOfCards;
        this.build(numberOfCards);

        this.icon = document.getElementById("deckIcon");
    }

    draw(context) {
        this.game.view.apply();

        if (this.empty) {
            let cR = this.cornerRadius;
            context.fillStyle = this.game.colors.medium;//"#4a6f71";
            context.strokeStyle = this.game.colors.medium;//"#4a6f71";
            // context.fillRect(this.x, this.y, this.width, this.height);
            context.lineJoin = "round";
            context.lineWidth = cR;
            context.strokeRect(this.x+(cR/2), this.y+(cR/2), this.width-cR, this.height-cR);
            context.fillRect(this.x+(cR/2), this.y+(cR/2), this.width-cR, this.height-cR);
            context.strokeStyle = "black";
            context.lineWidth = 15;
            
            context.beginPath();
            context.moveTo(this.x+60,this.y+120);
            context.lineTo(this.x+this.width-60,this.y+this.height-120);
            context.stroke();

            context.beginPath();
            context.moveTo(this.x+60,this.y+this.height-120);
            context.lineTo(this.x+this.width-60,this.y+120);
            context.stroke();
        }
        else {
            this.cards[0].draw(context);
        }
        
        // deck icon overlay
        this.game.ctx.setTransform(1, 0, 0, 1, 0, 0);
        let radius = 20;
        const center = this.game.view.applyTransformTo(this.right - radius/2, this.bottom - radius/2);
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'white';
        context.fill();
        context.lineWidth = 5
        context.strokeStyle = "black";
        context.stroke();

        let iconSize = radius*1.25;
        context.drawImage(this.icon, center.x-iconSize/2, center.y-iconSize/2, iconSize, iconSize);
    }

    activate() {
        this.drawCard();
    }

    shuffle = () => {
        //pilfered from https://bost.ocks.org/mike/shuffle/
        var m = this.cards.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = this.cards[m];
            this.cards[m] = this.cards[i];
            this.cards[i] = t;
        }
    }

    drawCard = () => {
        if (this.cards.length > 0) {
            let drawn = this.cards.shift();

            drawn.play();
            this.game.addObject(drawn);
    
            this.drawInProgress = true;
        }

        if (this.cards.length === 0) {
            this.empty = true;
        }
    }

    build = (numberOfCards) => {
        this.cards = [];

        for (let i = 1; i < numberOfCards + 1; i++) {
            this.cards.push(new Card(this.game, this, i, this.handleDrawn));
        }

        this.shuffle();

        this.empty = numberOfCards === 0;
    }

    handleDrawn = () => {
        this.drawInProgress = false;
    }
}