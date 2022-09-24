import { GameObject } from "./gameObject.js";
import { AnimationData } from "./animationData.js";
import { Text } from "./text.js";

export class Die extends GameObject {
    constructor(game, sides = 6, startX = 0, startY = 0, startZ = 0) {
        super(game, startX, startY, startZ);

        this.sides = sides;
        this.number = -1;
        this.width = 60;
        this.height = 60;
        this.fontSize = 38;
        this.isRandomizable = true;
        this.fontFace = "bungee";
        this.cornerRadius = 5;

        this.animations = {
            rolling: new RollAnimation(this)
        }
        this.spriteSheet = document.getElementById("d6Sprite");
    }

    get isInteractable() {
        return !this.animations.rolling.status;
    }

    update() {
        if (this.animations.rolling.status) {
            let anim = this.animations.rolling;
            anim.update();

            if (anim.elapsed >= anim.duration) {
                anim.end();
                this.number = anim.newNumber;
            }
        }
    }

    draw(context) {
        // this.drawHighlight(context);

        this.game.view.apply();

        this.drawShadow(context, this.animations.rolling.status);

        if (this.animations.rolling.status) {
            let anim = this.animations.rolling;
            context.drawImage(this.spriteSheet, anim.frameX, 0, 160, 160, this.x - 10, this.y - 10, 80, 80);
        }
        else {
            context.drawImage(this.spriteSheet, 0, 0, 160, 160, this.x - 10, this.y - 10, 80, 80);
            this.drawNumber(context);
        }

        context.transform(1, 0, 0, 1, 0, 0);

        this.drawSelected(context);
    }

    drawNumber(context) {
        context.fillStyle = "white";
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.font = `${this.fontSize}px ${this.fontFace}`;

        context.lineWidth = 2;
        context.strokeStyle = "gray";
        const text = this.number > 0 ? this.number.toString() : "?";
        context.strokeText(text, this.x + this.width / 2, this.y + this.height / 2);
        context.fillText(text, this.x + this.width / 2, this.y + this.height / 2);
    }

    activate() {
        this.roll();
    }

    randomize = () => {
        this.roll();
    }

    roll = () => {
        this.animations.rolling.start(this);
    }

    static serializableProperties = ["sides", "number"];
    serialize() {
        const propsToSerialize = [...GameObject.serializableProperties, ...Die.serializableProperties];
        return JSON.stringify(this, propsToSerialize, 0);
    }
}

export class RollAnimation extends AnimationData {
    constructor(die, duration = 1000, sprites = 6, frameSize = 160) {
        super(duration);

        this.sides = die.sides;
        this.frameSize = frameSize;
        this.sprites = sprites;
        this.currentSprite = 6;
    }

    start() {
        super.start();

        this.#roll(1, this.sides);
    }

    update() {
        super.update();

        const speed = (.5 - Math.abs(this.elapsedPercent - .5));
        this.currentSprite += speed;
        this.currentSprite = this.currentSprite > this.sprites ? 1 : this.currentSprite;

        this.frameX = Math.floor(this.currentSprite) * this.frameSize;
    }

    end() {
        super.end();
        this.currentSprite = 6;
    }

    #roll(min, max) {
        this.newNumber = min + Math.floor(Math.random() * (max - min + 1));
    }
}