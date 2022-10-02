import { GameObject } from "./gameObject.js";
import { AnimationData } from "./animationData.js";
import { Text } from "./text.js";

export class Die extends GameObject {
    static config = {
        2: {
            frames: 24,
            frameSize: 300,
            width: 100,
            height: 100,
            radius: 57
        },
        4: {
            frames: 24,
            frameSize: 300,
            width: 85,
            height: 85,
            points: [
                { x: 0, y: -55 },
                { x: 52, y: 37 },
                { x: -52, y: 37 },
            ]
        },
        6: {
            frames: 24,
            frameSize: 300,
            width: 70,
            height: 70
        },
        8: {
            frames: 24,
            frameSize: 300,
            width: 85,
            height: 85,
            points: [
                { x: 0, y: -49 },
                { x: 41, y: -24 },
                { x: 43, y: 25 },
                { x: 0, y: 49 },
                { x: -43, y: 25 },
                { x: -41, y: -24 }
            ]
        },
        10: {
            frames: 24,
            frameSize: 300,
            width: 85,
            height: 85,
            points: [
                { x: 0, y: -40 },
                { x: 49, y: -16 },
                { x: 49, y: 17 },
                { x: 0, y: 41 },
                { x: -49, y: 17 },
                { x: -49, y: -16 }
            ]
        },
        12: {
            frames: 24,
            frameSize: 300,
            width: 90,
            height: 90,
            points: [
                { x: 0, y: -47 },
                { x: 26, y: -39 },
                { x: 45, y: -15 },
                { x: 45, y: 16 },
                { x: 26, y: 40 },
                { x: 0, y: 48 },
                { x: -26, y: 40 },
                { x: -45, y: 16 },
                { x: -45, y: -15 },
                { x: -26, y: -39 }
            ]
        },
        20: {
            frames: 24,
            frameSize: 300,
            width: 90,
            height: 90,
            points: [
                { x: 0, y: -50 },
                { x: 44, y: -26 },
                { x: 44, y: 27 },
                { x: 0, y: 51 },
                { x: -44, y: 27 },
                { x: -44, y: -26 }
            ]
        }
    }
    #sides;

    constructor(game, sides = 6, startX = 0, startY = 0, startZ = 0) {
        super(game, startX, startY, startZ);

        this.number = -1;
        this.fontSize = 38;
        this.isRandomizable = true;
        this.fontFace = "bungee";
        this.cornerRadius = 5;

        this.sides = sides;
    }

    get sides() {
        return this.#sides;
    }
    set sides(val) {
        this.#sides = val;

        Object.assign(this, Die.config[val]);
        this.frameOffset = (this.frameSize * .6666 - this.width) / 2;


        this.animations = {
            rolling: new RollAnimation(this, 1000, this.frames, this.frameSize)
        }
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

        // this.drawShadow(context, this.animations.rolling.status);

        if (this.animations.rolling.status) {
            let anim = this.animations.rolling;
            context.drawImage(this.spriteSheet, anim.frameX, 0, this.frameSize, this.frameSize, this.x - this.frameOffset, this.y - this.frameOffset, this.frameSize * .66666, this.frameSize * .66666);
        }
        else {
            const framex = this.dragging ? 0 : this.frameSize;
            context.drawImage(this.spriteSheet, framex, 0, this.frameSize, this.frameSize, this.x - this.frameOffset, this.y - this.frameOffset, this.frameSize * .66666, this.frameSize * .66666);
            this.drawNumber(context);
        }

        context.transform(1, 0, 0, 1, 0, 0);

        this.drawSelected(context);
    }

    drawNumber(context) {
        context.fillStyle = "white";
        context.textBaseline = "middle";
        context.textAlign = "center";
        let size = this.dragging ? this.fontSize + 3 : this.fontSize;
        context.font = `${size}px ${this.fontFace}`;

        context.lineWidth = 2;
        context.strokeStyle = "#0d4178";
        let text = this.number > 0 ? this.number.toString() : "?";

        if (this.sides === 2) {
            context.fillStyle = "#ddddcf";
            context.strokeStyle = "#a5a799";
            size = this.dragging ? this.fontSize * 2 + 3 : this.fontSize * 2;
            context.font = `${size}px ${this.fontFace}`;
            text = this.number === 1 ? "+" : "-";
        }

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
    constructor(die, duration = 1000, frames, frameSize) {
        super(duration);

        this.startFrame = 1;
        this.sides = die.sides;
        this.frameSize = frameSize;
        this.frames = frames;
        this.currentFrame = this.frames;
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

        this.frameX = Math.floor(this.currentFrame + this.startFrame) * this.frameSize;
    }

    end() {
        super.end();
        this.currentFrame = this.frames;
    }

    #roll(min, max) {
        this.newNumber = min + Math.floor(Math.random() * (max - min + 1));
    }
}