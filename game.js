import { View } from "./view.js";
import { Card } from "./card.js";
import { Editor } from "./editor.js";

export class Game {
    gridScale = 100;
    colors = { dark: "#005793", medium: "#569acd", light: "#CED8F7", highlight: "#33ccff", select: "#569acd" };
    #nextZ = 0;
    objects = [];
    selected = new Set();
    mode = Mode.Play;

    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.view = new View(ctx);
        this.editor = new Editor(this);
    }

    get selectionCount() {
        return this.selected.size;
    }

    get editTarget() {
        return this.selected.values().next().value;
    }

    update() {
        this.objects.sort((a, b) => {
            return a.z > b.z ? 1 : -1;
        });

        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].z = i;
            this.objects[i].update();
            this.#nextZ = i + 1;
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

    get nextZ() {
        const result = this.#nextZ;
        this.#nextZ++;
        return result;
    }

    addObject(object, z = -1) {
        if (z < 0) {
            object.z = this.#nextZ;
            this.#nextZ++;
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
        this.exitEditMode();
    }

    isSelectionEditable() {
        if (this.selected.size !== 1) {
            return false;
        }

        return this.editTarget.isEditable && (!(this.editTarget instanceof Card) || this.editTarget.isFaceUp);
    }

    enterEditMode() {
        if (this.isSelectionEditable()) {
            this.mode = Mode.Edit;
            this.editor.start(this.editTarget);
        }
    }

    exitEditMode() {
        if (this.mode == Mode.Edit) {
            this.mode = Mode.Play;
            this.editor.end();
        }
    }
}

export const Mode = {
    Play: 'Play',
    Edit: 'Edit'
};