import { GameObject } from "./gameObject.js";
import { AnimationData } from "./animationData.js";

export class Card extends GameObject {
    isFaceUp = false;
    inDeck = true;
    drawing = false;

    flipping = false;
    playing = false;
    constructor(game, deck, number, drawnHandler, startX = 0, startY = 0, startZ = 0) {
        super(game, startX, startY, startZ);

        this.deck = deck;
        this.x = deck.x;
        this.y = deck.y;
        this.width = 250;
        this.height = 350;

        this.number = number;
        this.drawnHandler = drawnHandler;

        this.animations = {
            flipping: new AnimationData(100), 
            playing: new AnimationData(500),
        }
    }

    get posX() {return this.inDeck ? this.deck.x : this.x}
    get posY() {return this.inDeck ? this.deck.y : this.y}

    update() {
        if (this.animations.playing.status) {
            let anim = this.animations.playing;
            anim.update();

            if (anim.elapsed >= anim.duration) {
                this.y = anim.targetValues[1];
                anim.end();

                console.log("done playing!");
                this.isFaceUp = true;
                
                this.drawnHandler();
            }
            else {
                let diffY = anim.targetValues[1] - anim.startValues[1];
                let plusY = diffY * anim.elapsedPercent;
                this.y = anim.startValues[1] + plusY;
            }
        }
        if(this.animations.flipping.status) {
            let anim = this.animations.flipping;
            anim.update();

            if (anim.elapsed > anim.duration) {
                anim.end();
                this.isFaceUp = !this.isFaceUp;
            }
        }
    }

    // draw(context) {
    //     let cR = this.cornerRadius;
    //     context.fillStyle = this.isFaceUp ? "white" : "#333333";//"#4a6f71";
    //     context.strokeStyle = "#333333";//"#4a6f71";
    //     // context.fillRect(this.x, this.y, this.width, this.height);
    //     context.lineJoin = "round";
    //     context.lineWidth = cR;
    //     context.strokeRect(this.posX+(cR/2), this.posY+(cR/2), this.width-cR, this.height-cR);
    //     context.fillRect(this.posX+(cR/2), this.posY+(cR/2), this.width-cR, this.height-cR);
    //     context.strokeStyle = "white";
    //     context.lineWidth = 8;
    //     context.strokeRect(this.posX+15, this.posY+15, this.width-30, this.height-30);
        
    //     if (this.isFaceUp) {
    //         context.fillStyle = "black";
    //         context.font = "100px Arial";
    //         context.textBaseline = "middle"; 
    //         context.textAlign = "center";
    //         context.fillText(this.number, this.posX+this.width/2, this.posY+this.height/2);
    //     }
    //     else {
    //         context.beginPath();
    //         context.moveTo(this.posX+15,this.posY+15);
    //         context.lineTo(this.posX+this.width-15,this.posY+this.height-15);
    //         context.stroke();
    
    //         context.beginPath();
    //         context.moveTo(this.posX+15,this.posY+this.height-15);
    //         context.lineTo(this.posX+this.width-15,this.posY+15);
    //         context.stroke();
    //     }
    // }

    play = () => {
        this.inDeck = false;
        this.x = this.deck.x;
        this.y = this.deck.y;
        this.animations.playing.start([this.x, this.y], [this.x,  this.y + 30 + this.height]);
    }

    activate() {
        this.flip();
    }

    flip = () => {
        this.animations.flipping.start();
    }
}