import { GameObject } from "./gameObject.js";
import { AnimationData } from "./animationData.js";
import { Text } from "./text.js";

export class Die extends GameObject {
    #sides;

    constructor(game, sides = 6, startX = 0, startY = 0, startZ = 0) {
        super(game, startX, startY, startZ);

        this.#sides = sides;
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
        this.spriteSheet = document.getElementById(`d${this.#sides}Sprites`);
    }

    get sides() {
        return this.#sides;
    }
    set sides(val) {
        this.#sides = val;
        this.animations.rolling.sides = this.#sides;
        this.spriteSheet = document.getElementById(`d${this.#sides}Sprites`);
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
        this.drawHighlight(context);

        this.game.view.apply();

        this.drawShadow(context, this.animations.rolling.status);

        if (this.animations.rolling.status) {
            let anim = this.animations.rolling;
            context.drawImage(this.spriteSheet, anim.frameX, 0, 200, 200, this.x - 30, this.y - 30, 120, 120);
        }
        else {
            context.drawImage(this.spriteSheet, 0, 0, 200, 200, this.x - 30, this.y - 30, 120, 120);
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
    constructor(die, duration = 1000, frames = 24, frameSize = 200) {
        super(duration);

        this.sides = die.sides;
        this.frameSize = frameSize;
        this.frames = frames;
        this.currentFrame = frames;
    }

    start() {
        super.start();

        this.#roll(1, this.sides);
    }

    update() {
        super.update();

        // const speed = .334;//(.5 - Math.abs(this.elapsedPercent - .5));
        // this.currentFrame += speed;
        // this.currentFrame = this.currentFrame > this.frames ? 0 : this.currentFrame;
        this.currentFrame = Math.floor(this.elapsedPercent * this.frames);

        this.frameX = Math.floor(this.currentFrame) * this.frameSize;
    }

    end() {
        super.end();
        this.currentFrame = this.frames;
    }

    #roll(min, max) {
        this.newNumber = min + Math.floor(Math.random() * (max - min + 1));
    }
}