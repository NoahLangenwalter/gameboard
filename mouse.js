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
    clickSpeed = 125;
    constructor(game) {
        this.game = game;

        game.canvas.addEventListener("mousedown", this.update, { passive: true });
        game.canvas.addEventListener("mouseup", this.update, { passive: true });
        game.canvas.addEventListener("mouseout", this.update, { passive: true });
        game.canvas.addEventListener("mousemove", this.update, { passive: true });
        game.canvas.addEventListener("wheel", this.update, { passive: false });
    }

    update = (event) => {
        this.oldX = this.x;
        this.oldY = this.y;

        const bounds = this.game.canvas.getBoundingClientRect();
        this.x = event.clientX - bounds.left;
        this.y = event.clientY - bounds.top;

        if (event.type === "mousedown") {
            if (!this.leftButton & !this.rightButton) {
                this.lastDown = Date.now();
            }

            this.leftButton = event.button === 0;
            this.rightButton = event.button === 2;

            if (this.leftButton) {
                let obj = this.detectObject();
                if (obj !== null) {
                    this.#dragging = obj;
                    this.setDragOffset();
                    this.#dragging.pickUp(event);
                }
            }
        }
        else if (event.type === "mouseup") {
            let clicked = false;
            if (Date.now() - this.lastDown < this.clickSpeed) {
                clicked = true;
            }

            if (this.leftButton) {
                if (this.isDragging) {
                    this.#dragging.putDown();
                    this.#dragging = null;
                }
                if (clicked) {
                    let obj = this.detectObject();
                    if (obj !== null) {
                        obj.activate();
                    }
                }
            }

            this.leftButton = this.rightButton = false;
        }
        else if (event.type === "mouseout") {
            this.leftButton = this.rightButton = false;
            this.x = -1;
            this.y = -1;
        }
        else if (event.type === "wheel") {
            const view = this.game.view;
            if (event.deltaY < 0 & view.scale < view.maxZoom) {
                view.scaleAt({x: this.x,y: this.y }, 1.1);
            }
            else if (event.deltaY > 0 & view.scale > view.minZoom) {
                view.scaleAt({x:  this.x,y: this.y }, 1 / 1.1);
            }
            event.preventDefault();
        }

        if (this.leftButton & this.isDragging) {
            const mouseinWorld = this.game.view.toWorld(this.x, this.y);
            const x = mouseinWorld.x - this.#dragOffset.x;
            const y = mouseinWorld.y - this.#dragOffset.y;
            this.#dragging.moveTo(x, y);
        }
        else if (this.rightButton) {
            this.game.view.pan({ x: this.x - this.oldX, y: this.y - this.oldY });
        }
    }

    startDrag(object) {
        this.#dragging = object;
        this.#dragging.pickup();
    }

    drag() {
        const x = this.x - this.#dragOffset.x;
        const y = this.y - this.#dragOffset.y;
        this.#dragging.drag(x, y);
    }

    endDrag() {
        this.#dragging.putDown();
        this.#dragging = null;
    }

    setDragOffset() {
        const mouseInWorld = this.game.view.toWorld(this.x, this.y);
        this.#dragOffset.x = mouseInWorld.x - this.#dragging.x;
        this.#dragOffset.y = mouseInWorld.y - this.#dragging.y;
    }

    detectObject() {
        var object = null;
        let index = 0;
        while (object === null & index < this.game.objects.length) {
            if (this.game.objects[index].isAt(this.x, this.y)) {
                object = this.game.objects[index];
            }
            index = index + 1;
        }

        return object;
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

    get isDragging() { return this.#dragging !== null; }
}