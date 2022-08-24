export class Mouse {
    x = 0;
    y = 0;
    oldX = 0;
    oldY = 0;
    leftButton = false;
    rightButton = false;
    lastDown = Date.now();
    #dragging = null;
    #dragOffset = { x: 0, y: 0 };
    #hovering = null;
    clickSpeed = 125;
    constructor(game) {
        this.game = game;

        game.canvas.addEventListener("mousedown", this.onMouseEvent, { passive: true });
        game.canvas.addEventListener("mouseup", this.onMouseEvent, { passive: true });
        game.canvas.addEventListener("mouseout", this.onMouseEvent, { passive: true });
        game.canvas.addEventListener("mousemove", this.onMouseEvent, { passive: true });
        game.canvas.addEventListener("wheel", this.onMouseEvent, { passive: false });
    }

    get isDragging() { return this.#dragging !== null; }
    get isHovering() { return this.#hovering !== null; }

    update() {
        this.updateHover();
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
            this.handleMouseUp();
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
        if (this.#hovering !== null & (newHover === null || this.#hovering !== newHover || !this.#hovering.isInteractable)) {
            this.#hovering.hoverLeave();
            this.#hovering = null;
        }

        if (this.#hovering === null & newHover !== null && newHover.isInteractable) {
            this.#hovering = newHover;
            this.#hovering.hoverEnter();
        }
    }

    handleMouseDown(event) {
        if (!this.leftButton & !this.rightButton) {
            this.lastDown = Date.now();
        }

        this.leftButton = event.button === 0;
        this.rightButton = event.button === 2;

        if (this.leftButton) {
            let obj = this.detectTopObject();
            if (obj !== null) {
                this.startDrag(obj);
            }
            else {
                this.game.clearSelection();
            }
        }
    }

    handleMouseUp() {
        let clicked = false;
        if (Date.now() - this.lastDown < this.clickSpeed) {
            clicked = true;
        }

        if (this.leftButton) {
            if (this.isDragging) {
                this.endDrag();
            }
            if (clicked) {
                let obj = this.detectTopObject();
                if (obj !== null) {
                    this.game.selectObject(obj);
                    // obj.activate();
                }
            }
        }

        this.leftButton = this.rightButton = false;
    }

    handleMouseOut() {
        this.leftButton = this.rightButton = false;
        this.x = -1;
        this.y = -1;

        if(this.isDragging) {
            this.endDrag();
        }
    }

    handleWheel(event) {
        const view = this.game.view;
        if (event.deltaY < 0 & view.scale < view.maxZoom) {
            view.scaleAt({ x: this.x, y: this.y }, 1.1);
        }
        else if (event.deltaY > 0 & view.scale > view.minZoom) {
            view.scaleAt({ x: this.x, y: this.y }, 1 / 1.1);
        }
        event.preventDefault();
    }

    startDrag(object) {
        object.z = this.game.nextZ;
        this.#dragging = object;
        this.setDragOffset();
        this.#dragging.pickUp();

        if(this.game.isSelected(object)) {
            //TODO: drag all of 'em!
        }
        else {
            this.game.clearSelection();
        }
    }

    drag() {
        const mouseinWorld = this.game.view.toWorld(this.x, this.y);
        const x = mouseinWorld.x - this.#dragOffset.x;
        const y = mouseinWorld.y - this.#dragOffset.y;
        this.#dragging.moveTo(x, y);
    }

    endDrag() {
        this.#dragging.putDown();

        if (this.isHovering && this.#hovering.isCardTarget) {
            this.#hovering.returnCard(this.#dragging);
        }
        this.#dragging = null;
    }

    setDragOffset() {
        const mouseInWorld = this.game.view.toWorld(this.x, this.y);
        this.#dragOffset.x = mouseInWorld.x - this.#dragging.x;
        this.#dragOffset.y = mouseInWorld.y - this.#dragging.y;
    }

    detectTopObject(ignored = null) {
        var found = null;
        let index = this.game.objects.length - 1;
        while (found === null & index > -1) {
            const obj = this.game.objects[index];
            if (obj.isAt(this.x, this.y)) {
                found = this.game.objects[index];
                if (!found.isInteractable) {
                    return null;
                }
                if (found === ignored) {
                    found = null;
                }
            }
            index--;
        }

        return found;
    }

    draw() {
        const worldCoord = this.game.view.toWorld(this.x, this.y);
        this.game.view.apply();
        const context = this.game.ctx;
        context.lineWidth = 1;
        context.strokeStyle = "black";
        context.beginPath();
        context.moveTo(worldCoord.x - 10, worldCoord.y);
        context.lineTo(worldCoord.x + 10, worldCoord.y);
        context.moveTo(worldCoord.x, worldCoord.y - 10);
        context.lineTo(worldCoord.x, worldCoord.y + 10);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.stroke();
    }
}