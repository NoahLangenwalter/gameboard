import { View } from "./view.js";

export class Game {
    gridScale = 100;
    colors = { dark: "#005782", medium: "#569abc", light: "#CED8F7", highlight: "#33ccff", select: "black" };
    nextZ = 0;

    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.objects = [];
        this.view = new View(ctx);
        this.selected = new Set();
    }

    update() {
        this.objects.sort((a, b) => {
            return a.z > b.z ? 1 : -1;
        });

        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].z = i;
            this.objects[i].update();
        }

        // info.textContent = "Scale: " + this.view.scale.toFixed(4) + " (1px = " + (1 / this.view.scale).toFixed(4) + " world px) - ";
        // info.textContent += "Offset: " + this.view.offset.x.toFixed(2) + "," + this.view.offset.x.toFixed(2) + " - ";
    }

    draw() {
        this.drawGrid();

        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].draw(this.ctx);
        }
    }

    addObject(object, z = -1) {
        if (z < 0) {
            object.z = this.nextZ;
            this.nextZ++;
        }
        this.objects.push(object);
    }

    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index >= 0) {
            this.deselectObject(object);
            this.objects.splice(index, 1);
        }
    }

    selectObject(object, isMulti = false) {
        if (!isMulti) {
            this.clearSelection();
        }

        this.selected.add(object);
        object.select();
    }

    deselectObject(object) {
        this.selected.delete(object);
        object.deselect();
    }

    isSelected(object) {
        return this.selected.has(object);
    }

    clearSelection() {
        for (const obj of this.selected.values()) {
            obj.deselect();
        }

        this.selected.clear();
    }

    drawGrid() {
        const context = this.ctx;
        const scale = 1 / this.view.scale;
        const size = Math.max(this.canvas.width, this.canvas.height) * scale + this.gridScale * 2;
        const x = ((-this.view.offset.x * scale - this.gridScale) / this.gridScale | 0) * this.gridScale;
        const y = ((-this.view.offset.y * scale - this.gridScale) / this.gridScale | 0) * this.gridScale;

        this.view.apply();
        context.lineWidth = 1;
        context.strokeStyle = "#CEF";
        context.beginPath();
        for (var i = 0; i < size; i += this.gridScale) {
            context.moveTo(x + i, y);
            context.lineTo(x + i, y + size);
            context.moveTo(x, y + i);
            context.lineTo(x + size, y + i);
        }
        context.setTransform(1, 0, 0, 1, 0, 0); // reset the transform so the lineWidth is 1
        context.stroke();
    }
}