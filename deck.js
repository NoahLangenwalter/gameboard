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

    get bottom() {return this.y + this.height }
    get right() {return this.x + this.width }

    // draw(context) {
    //     if (this.empty) {
    //         let cR = this.cornerRadius;
    //         context.fillStyle = "#aaaaaa";//"#4a6f71";
    //         context.strokeStyle = "#aaaaaa";//"#4a6f71";
    //         // context.fillRect(this.x, this.y, this.width, this.height);
    //         context.lineJoin = "round";
    //         context.lineWidth = cR;
    //         context.strokeRect(this.x+(cR/2), this.y+(cR/2), this.width-cR, this.height-cR);
    //         context.fillRect(this.x+(cR/2), this.y+(cR/2), this.width-cR, this.height-cR);
    //         context.strokeStyle = "#333333";
    //         context.lineWidth = 15;
            
    //         context.beginPath();
    //         context.moveTo(this.x+60,this.y+120);
    //         context.lineTo(this.x+this.width-60,this.y+this.height-120);
    //         context.stroke();

    //         context.beginPath();
    //         context.moveTo(this.x+60,this.y+this.height-120);
    //         context.lineTo(this.x+this.width-60,this.y+120);
    //         context.stroke();
    //     }
    //     else {
    //         this.cards[0].draw(context);
    //     }
        
    //     // deck icon overlay
    //     let radius = 20/this.game.view.scale;
    //     let centerX = this.right - radius/2;
    //     let centerY = this.bottom - radius/2;
    //     context.beginPath();
    //     context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    //     context.fillStyle = 'white';
    //     context.fill();
    //     context.lineWidth = 5/this.game.view.scale;
    //     context.strokeStyle = "black";
    //     context.stroke();

    //     let iconSize = radius*1.25;
    //     context.drawImage(this.icon, centerX-iconSize/2, centerY-iconSize/2, iconSize, iconSize);
    // }

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

        // this.element.classList.remove("empty");
    }

    handleDrawn = () => {
        this.drawInProgress = false;
    }
}