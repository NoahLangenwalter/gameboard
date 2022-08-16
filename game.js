import { View } from "./view.js";

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.objects = [];
        this.view = new View(ctx);
    }
    update() {
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].update();
        }
    }
    draw() {
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].draw(this.ctx);
        }
    }
    addObject(object) {
        this.objects.push(object);
    }
}