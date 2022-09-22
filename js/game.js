import { View } from "./view.js";
import { Card } from "./card.js";
import { Deck } from "./deck.js";
import { Note } from "./note.js";
import { Editor } from "./editor.js";

export class Game {
    gridScale = 100;
    colors = { dark: "#005793", medium: "#569acd", light: "#CED8F7", highlight: "#33ccff", select: "#569acd" };
    font = "permanent_markerregular";
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

    set creator(val) {
        this.create = val;
    }

    sortByZ(a, b) {
        return a.z > b.z ? 1 : -1;
    };

    update() {
        this.objects.sort(this.sortByZ);

        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].z = i;
            this.objects[i].update();
            this.#nextZ = i + 1;
        }

        // this.selected.sort(this.sortByZ);

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

    selectAll() {
        this.selected = new Set(this.objects);

        this.objects.forEach(obj => {
            obj.select();
        });
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

    isSelectionShuffleable() {
        if (this.selected.size === 0) {
            return false;
        }

        for (const obj of this.selected.values()) {
            if (!obj.isShuffleable) {
                return false;
            }
        }

        return true;
    }

    enterEditMode() {
        if (this.isSelectionEditable()) {
            this.mode = Mode.Edit;
            this.editTarget.z = this.nextZ;
            this.editor.start(this.editTarget);
        }
    }

    exitEditMode() {
        if (this.mode === Mode.Edit) {
            this.mode = Mode.Play;
            this.editor.end();
        }
    }

    enterCreateMode() {
        if (this.mode === Mode.Edit) {
            this.editor.end();
        }
        this.mode = Mode.Create;
    }

    cancelCreate() {
        if (this.mode === Mode.Create) {
            this.mode = Mode.Play;
            this.create.clearSelection();
        }
    }

    completeCreationAt(screenPos) {
        if (this.mode === Mode.Create) {
            this.create.completeCreationAt(screenPos);
            this.mode = Mode.Play;
        }
    }

    copy() {
        if (this.selected.size === 0) {
            return;
        }

        const copied = {center: {x: 0, y: 0}, objects: []};

        const min = {x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER};
        const max = {x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER};
        
        let serializedObjects = "[";
        for (const obj of this.selected.values()) {
            serializedObjects += obj.serialize() + ",";
            
            min.x = Math.min(obj.x, min.x);
            min.y = Math.min(obj.y, min.y);
            max.x = Math.max(obj.right, max.x);
            max.y = Math.max(obj.bottom, max.y);
        }
        
        serializedObjects = serializedObjects.slice(0, -1);
        serializedObjects += "]";

        copied.center.x = min.x + (max.x - min.x) / 2;
        copied.center.y = min.y + (max.y - min.y) / 2;

        let serializedState = JSON.stringify(copied);
        serializedState = serializedState.replace("[]", serializedObjects);

        localStorage.setItem('copied', serializedState);

        const date = new Date();
        // info.textContent = "Copied at: " + date.toISOString();
    }

    paste(newCenter = null) {

        //get from localStorage
        const copiedData = localStorage.getItem("copied");

        if (copiedData) {
            const copied = JSON.parse(copiedData);

            // center on mouse
            const centerOffset = {x: 0, y: 0}; 
            if(newCenter !== null) {
                centerOffset.x = newCenter.x - copied.center.x;
                centerOffset.y = newCenter.y - copied.center.y;
            }

            if (copied.objects.length > 0) {
                this.clearSelection();
            }

            // create objects
            const topZ = this.nextZ;
            copied.objects.forEach(obj => {
                obj.x += centerOffset.x;
                obj.y += centerOffset.y;
                obj.z += topZ;

                const original_class = eval(obj.className);

                const classedObj = new original_class(this);

                classedObj.deserialize(obj);

                this.addObject(classedObj, classedObj.z);

                //select copied
                this.selectObject(classedObj, true);
            });
        }

    }
}

export const Mode = {
    Play: "Play",
    Edit: "Edit",
    Create: "Create"
};