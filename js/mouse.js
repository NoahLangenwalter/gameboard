import { Card } from './card.js';
import { Mode } from './game.js';

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
    #targeter = null;
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
    get isTargeting() { return this.#targeter !== null; }
    get targeter() { return this.#targeter; }
    get targetAcquired() { return this.isTargeting && this.isHovering && this.hoverTarget !== this.#targeter && this.hoverTarget.isCardTarget; }

    update() {
        this.updateHover();
    }

    draw() {
        const context = this.game.ctx;
        this.game.ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (this.dragSelect) {

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
        }

        if (this.isTargeting && this.hoverTarget !== this.#targeter) {
            const from = this.game.view.toScreen(this.#targeter.x + this.#targeter.width / 2, this.#targeter.y + this.#targeter.height / 2);
            let r = 25;
            let to = { x: this.x, y: this.y };
            if (this.isHovering) {
                to = this.game.view.toScreen(this.hoverTarget.x + this.hoverTarget.width / 2, this.hoverTarget.y + this.hoverTarget.height / 2);
            }
            const length = Math.abs(to.y - from.y) + Math.abs(to.x - from.x);
            const xBackoff = (to.x - from.x) / length;
            const yBackoff = (to.y - from.y) / length;
            to.x -= xBackoff * r;
            to.y -= yBackoff * r;
            let toCenterX = to.x;
            let toCenterY = to.y;

            // Equivalent to "hightlight" color: #33CCFF
            const color = "rgba(51, 204, 255, .5)";
            context.fillStyle = color;
            context.lineWidth = r;
            context.lineCap = "butt";
            const gradient = context.createLinearGradient(from.x, from.y, to.x, to.y);
            gradient.addColorStop(0, "rgba(51, 204, 255, 0)");
            gradient.addColorStop(1, color);
            context.strokeStyle = gradient;

            context.beginPath();
            context.moveTo(from.x, from.y);
            context.lineTo(to.x, to.y);
            context.stroke();

            context.beginPath();
            let angle = Math.atan2(to.y - from.y, to.x - from.x)
            let x = r * Math.cos(angle) + toCenterX;
            let y = r * Math.sin(angle) + toCenterY;
            toCenterX += r / 2 * Math.cos(angle);
            toCenterY += r / 2 * Math.sin(angle);
            context.moveTo(x, y);
            angle += (1 / 3) * (2 * Math.PI)
            x = r * Math.cos(angle) + toCenterX;
            y = r * Math.sin(angle) + toCenterY;
            context.lineTo(x, y);
            angle += (1 / 3) * (2 * Math.PI)
            x = r * Math.cos(angle) + toCenterX;
            y = r * Math.sin(angle) + toCenterY;
            context.lineTo(x, y);
            context.closePath();
            context.fill();
        }

        if (this.game.mode === Mode.Create) {
            const size = 16;
            const x = this.x - size / 4;
            const y = this.y - size / 4;

            context.lineWidth = 4;
            context.lineCap = "round";
            context.strokeStyle = "black";

            if (this.isHovering) {
                context.strokeStyle = "red";
            }

            context.beginPath();
            context.moveTo(x - size / 2, y);
            context.lineTo(x + size / 2, y);
            context.moveTo(x, y - size / 2);
            context.lineTo(x, y + size / 2);
            context.stroke();
            context.lineCap = "butt";
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

        if (this.leftButton && this.isDragging) {
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

        let draggingCards = false;
        if (this.isDragging) {
            for (const dragee of this.#dragging.values()) {
                if (dragee.obj instanceof Card) {
                    draggingCards = true;
                    break;
                }
            }
        }

        if (this.#hovering === null && !this.dragSelect && newHover !== null &&
            ((!this.isDragging && !this.isTargeting && newHover.isInteractable)
                || (draggingCards && newHover.isCardTarget)
                || (this.isTargeting && newHover.isCardTarget)
            )
        ) {
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
                if (event.ctrlKey && obj.isCardTarget) {
                    this.startTargeting(obj);
                }
                else {
                    this.startDrag(obj);
                }
            }
            else if (this.game.mode === Mode.Create) {
                this.game.completeCreationAt({ x: this.x, y: this.y });
            }
            else {
                if (!event.shiftKey) {
                    this.game.clearSelection();
                }

                this.dragSelect = true;
                this.dragSelectStart.x = this.x;
                this.dragSelectStart.y = this.y;
            }

            this.game.cancelCreate();
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
            if (this.isTargeting) {
                this.endTargeting(event);
            }
            if (clicks === 1) {
                this.handleLeftClick(event);
            } else if (clicks === 2) {
                this.handleDoubleClick(event);
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

        if (this.isTargeting) {
            this.endTargeting();
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

            if (!this.game.isSelected(obj)) {
                this.game.selectObject(obj, event.shiftKey);
            }
            else if (event.shiftKey) {
                this.game.deselectObject(obj);
            }
        }
    }

    handleDoubleClick(event) {
        if (this.game.isSelectionEditable()) {
            this.game.enterEditMode();
        }
        else if (this.game.isSelectionShuffleable()) {
            if (event.ctrlKey) {
                this.game.selected.drawCard(null, true);
            }
            else {
                this.game.selected.forEach(obj => { obj.shuffle() });
            }
        }
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
            const nextZ = this.game.nextZ;

            for (const dragee of this.#dragging.values()) {
                dragee.obj.pickUp();
                dragee.obj.z = dragee.obj.z + nextZ;
            }
            this.dragTimeout = null;
        }, this.clickSpeed * 0.8);
    }

    startTargeting(object) {
        if (object.isCardTarget && !object.isEmpty) {
            const objCenter = this.game.view.toScreen(object.x + object.width / 2, object.y + object.height / 2);
            this.dragStartX = objCenter.x;
            this.dragStartY = objCenter.y;

            this.dragTimeout = setTimeout(() => {
                this.#targeter = object;
                this.game.selectObject(this.#targeter);

                this.dragTimeout = null;
            }, this.clickSpeed * 0.8);
        }
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
            const cards = [];
            for (const dragee of this.#dragging.values()) {
                if (dragee.obj instanceof Card) {
                    cards.push(dragee.obj);
                }
            }
            this.#hovering.returnCards(cards);
        }
        this.#dragging.clear();
    }

    endTargeting(event = null) {
        let targetObj = null;
        if (this.targetAcquired) {
            targetObj = this.hoverTarget;
        }

        const targetPos = this.game.view.toWorld(this.x, this.y);
        this.#targeter.drawCardTo(targetPos, targetObj);

        this.#targeter = null;
    }

    cancelTargeting() {
        this.#targeter = null;
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