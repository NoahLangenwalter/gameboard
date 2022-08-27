import { Card } from './card.js';

export class Mouse {
    x = 0;
    y = 0;
    oldX = 0;
    oldY = 0;
    dragStartX = 0;
    dragStartY = 0;
    leftButton = false;
    rightButton = false;
    lastDown = Date.now();
    previousDown = Date.now();
    #dragging = new Set();
    #hovering = null;
    clickSpeed = 150;
    dragSelect = false;
    dragSelectStart = { x: 0, y: 0 };
    dragTimeout = null;
    constructor(game) {
        this.game = game;

        game.canvas.addEventListener("mousedown", this.onMouseEvent, { passive: true });
        game.canvas.addEventListener("mouseup", this.onMouseEvent, { passive: true });
        game.canvas.addEventListener("mouseout", this.onMouseEvent, { passive: true });
        game.canvas.addEventListener("mousemove", this.onMouseEvent, { passive: true });
        window.addEventListener("wheel", this.onMouseEvent, { passive: false });
    }

    get isDragging() { return this.#dragging.size > 0; }
    get isHovering() { return this.#hovering !== null; }
    get hoverTarget() { return this.#hovering; }

    update() {
        this.updateHover();
    }

    draw() {
        if (this.dragSelect) {
            const context = this.game.ctx;
            this.game.ctx.setTransform(1, 0, 0, 1, 0, 0);

            const start = this.dragSelectStart;
            context.fillStyle = this.game.colors.highlight;
            context.globalAlpha = 0.15;
            context.fillRect(start.x, start.y, this.x - start.x, this.y - start.y);
            context.globalAlpha = 1;
            context.lineJoin = "miter";
            context.lineWidth = 2;
            context.strokeStyle = "white";
            context.strokeRect(start.x, start.y, this.x - start.x, this.y - start.y);
            context.lineWidth = 2;
            context.setLineDash([2, 2]);
            context.strokeStyle = this.game.colors.select;
            context.strokeRect(start.x, start.y, this.x - start.x, this.y - start.y);
            context.setLineDash([]);

            // context.beginPath();
            // context.moveTo(start.x - 5, start.y);
            // context.lineTo(start.x + 5, start.y);
            // context.moveTo(start.x, start.y - 5);
            // context.lineTo(start.x, start.y + 5);
            // context.stroke();

            // context.beginPath();
            // context.moveTo(this.x - 5, this.y);
            // context.lineTo(this.x + 5, this.y);
            // context.moveTo(this.x, this.y - 5);
            // context.lineTo(this.x, this.y + 5);
            // context.stroke();
        }
    }

    onMouseEvent = (event) => {
        this.oldX = this.x;
        this.oldY = this.y;

        const bounds = this.game.canvas.getBoundingClientRect();
        this.x = event.clientX - bounds.left;
        this.y = event.clientY - bounds.top;

        if (event.type === "mousedown") {
            this.handleMouseDown(event);
        }
        else if (event.type === "mouseup") {
            this.handleMouseUp(event);
        }
        else if (event.type === "mouseout") {
            this.handleMouseOut();
        }
        else if (event.type === "wheel") {
            this.handleWheel(event);
        }

        if (this.leftButton & this.isDragging) {
            this.drag();
        }
        else if (this.rightButton) {
            this.game.view.pan({ x: this.x - this.oldX, y: this.y - this.oldY });
        }
    }

    updateHover() {
        const newHover = this.detectTopObject(this.#dragging);
        if (this.#hovering !== null && (newHover === null || this.#hovering !== newHover || !this.#hovering.isInteractable)) {
            this.#hovering.hoverLeave();
            this.#hovering = null;
        }

        if (this.isDragging) {
            let draggingCards = false;
            for (const dragee of this.#dragging.values()) {
                if (dragee.obj instanceof Card) {
                    draggingCards = true;
                    break;
                }
            }

            if (draggingCards && newHover !== null && newHover.isCardTarget) {
                this.#hovering = newHover;
                this.#hovering.hoverEnter();
            }
        }
        else if (!this.dragSelect && this.#hovering === null && newHover !== null && newHover.isInteractable) {
            this.#hovering = newHover;
            this.#hovering.hoverEnter();
        }
    }

    handleMouseDown(event) {
        this.game.exitEditMode();

        if (!this.leftButton & !this.rightButton) {
            this.previousDown = this.lastDown;
            this.lastDown = Date.now();
        }

        this.leftButton = event.button === 0;
        this.rightButton = event.button === 2;

        if (this.leftButton) {
            let obj = this.detectTopObject();
            if (obj !== null) {
                this.startDrag(obj);
                // this.startDrag(obj);
            }
            else {
                if (!event.shiftKey) {
                    this.game.clearSelection();
                }

                this.dragSelect = true;
                this.dragSelectStart.x = this.x;
                this.dragSelectStart.y = this.y;
            }
        }
    }

    handleMouseUp(event) {
        if (this.dragTimeout !== null) {
            clearTimeout(this.dragTimeout);
        }

        let clicks = 0;
        if (Date.now() - this.lastDown < this.clickSpeed) {
            clicks++;
        }
        if (this.lastDown - this.previousDown < this.clickSpeed * 2) {
            clicks++;
        }



        if (this.leftButton) {
            if (this.isDragging) {
                this.endDrag();
            }
            if (clicks === 1) {
                this.handleLeftClick(event);
            } else if (clicks === 2) {
                this.handleDoubleClick();
            }

            if (this.dragSelect) {
                this.selectWithinDragRegion();
            }
        }

        this.leftButton = this.rightButton = false;
        this.dragSelect = false;
        this.dragSelectStart.x = -1;
        this.dragSelectStart.y = -1;
    }

    handleMouseOut() {
        this.leftButton = this.rightButton = false;
        this.x = -1;
        this.y = -1;

        if (this.isDragging) {
            this.endDrag();
        }

        this.dragSelect = false;
    }

    handleWheel(event) {
        this.game.exitEditMode();

        const view = this.game.view;
        if (event.deltaY < 0 & view.scale < view.maxZoom) {
            view.scaleAt({ x: this.x, y: this.y }, 1.1);
        }
        else if (event.deltaY > 0 & view.scale > view.minZoom) {
            view.scaleAt({ x: this.x, y: this.y }, 1 / 1.1);
        }
        event.preventDefault();
    }

    handleLeftClick(event) {
        let obj = this.detectTopObject();
        if (obj !== null) {
            if (event.ctrlKey) {
                obj.activate();
            }
            else if (!this.game.isSelected(obj)) {
                this.game.selectObject(obj, event.shiftKey);
            }
            else if (event.shiftKey) {
                this.game.deselectObject(obj);
            }
        }
    }

    handleDoubleClick() {
        this.game.enterEditMode();
    }

    startDrag(object) {
        const dragCandidates = new Set();
        if (this.game.isSelected(object)) {
            for (const obj of this.game.selected.values()) {
                const offset = this.getDragOffset(obj);
                dragCandidates.add({ offset, obj });
            }
        }
        else {
            const offset = this.getDragOffset(object);
            dragCandidates.add({ offset, obj: object });
        }

        this.dragStartX = this.x;
        this.dragStartY = this.y;

        this.dragTimeout = setTimeout(() => {
            this.#dragging = dragCandidates;
            for (const dragee of this.#dragging.values()) {
                dragee.obj.pickUp();
                dragee.obj.z = this.game.nextZ;
            }
            this.dragTimeout = null;
        }, this.clickSpeed * 0.8);
    }

    drag() {
        const mouseinWorld = this.game.view.toWorld(this.x, this.y);

        for (const dragee of this.#dragging.values()) {
            const x = mouseinWorld.x - dragee.offset.x;
            const y = mouseinWorld.y - dragee.offset.y;
            dragee.obj.moveTo(x, y);
        }

        if (this.#dragging.size === 1 && !this.game.isSelected(this.#dragging.values().next().value.obj) && this.calculateDragDistance() > 10) {
            this.game.clearSelection();
        }
    }

    endDrag() {
        for (const dragee of this.#dragging.values()) {
            dragee.obj.putDown();
        }

        if (this.isHovering && this.#hovering.isCardTarget) {
            for (const dragee of this.#dragging.values()) {
                if (dragee.obj instanceof Card) {
                    this.#hovering.returnCard(dragee.obj);
                }
            }
        }
        this.#dragging.clear();
    }

    selectWithinDragRegion() {
        const start = this.dragSelectStart;
        const topLeft = { x: Math.min(start.x, this.x), y: Math.min(start.y, this.y) };
        const bottomRight = { x: Math.max(start.x, this.x), y: Math.max(start.y, this.y) };
        this.game.objects.forEach(obj => {
            if (!this.game.isSelected(obj) && obj.isOverlapping({ topLeft, bottomRight })) {
                this.game.selectObject(obj, true);
            }
        });
    }

    calculateDragDistance() {
        const start = this.dragStartX + this.dragStartY;
        const end = this.x + this.y;
        return Math.abs(start - end);
    }

    getDragOffset(object) {
        const mouseInWorld = this.game.view.toWorld(this.x, this.y);
        const x = mouseInWorld.x - object.x;
        const y = mouseInWorld.y - object.y;
        return { x, y };
    }

    detectTopObject(ignored = new Set()) {
        var found = null;
        let index = this.game.objects.length - 1;
        while (found === null & index > -1) {
            const obj = this.game.objects[index];
            if (obj.isAt(this.x, this.y)) {
                found = this.game.objects[index];
                if (!found.isInteractable) {
                    return null;
                }

                // if (ignored.has(found)) {
                for (const dragee of ignored.values()) {
                    if (found === dragee.obj) {
                        found = null;
                    }
                }
            }
            index--;
        }

        return found;
    }
}