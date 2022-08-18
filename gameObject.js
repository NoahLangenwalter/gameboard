export class GameObject {
    width = 100;
    height = 100;
    cornerRadius = 20;
    dragging = false;
    hovering = false;
    selected = false;
    isCardTarget = false;
    
    constructor(game, id, startX = 0, startY = 0, startZ = -1) {
        this.game = game;
        this.id = id;
        this.x = startX;
        this.y = startY;
        this.z = startZ;
    }
    
    get bottom() {return this.y + this.height }
    get right() {return this.x + this.width }

    activate() {
        // console.log("Activated: " + this);
    }

    pickUp() {
        this.dragging = true;
    }

    putDown() {
        this.dragging = false;
    }

    hoverEnter() {
        this.hovering = true;
    }

    hoverLeave() {
        this.hovering = false;
    }

    select() {
        this.selected = true;
    }

    unselect() {
        this.selected = false;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    update() {
        // console.log("Updated: " + this);
    }

    draw(context) {
        this.game.view.apply();

        const scale = this.game.view.scale;

        this.game.view.apply();
        context.fillStyle = "red";
        let cR = this.cornerRadius;
        context.fillStyle = "red";
        context.strokeStyle = "red";
        context.lineJoin = "round";
        context.lineWidth = cR;
        context.strokeRect(this.x+(cR/2), this.y+(cR/2), this.width-cR, this.height-cR);
        context.fillRect(this.x+(cR/2), this.y+(cR/2), this.width-cR, this.height-cR);
        context.strokeStyle = "white";
        context.lineWidth = 8;
        context.strokeRect(this.x+15, this.y+15, this.width-30, this.height-30);
        
        this.game.view.apply();
        context.beginPath();
        context.moveTo(this.x+15,this.y+15);
        context.lineTo(this.x+this.width-15,this.y+this.height-15);
        context.stroke();

        this.game.view.apply();
        context.beginPath();
        context.moveTo(this.x+15,this.y+this.height-15);
        context.lineTo(this.x+this.width-15,this.y+15);
        context.stroke();
    }

    isAt(hitX, hitY) {
        const screenPos = this.game.view.toScreen(this.x, this.y);
        const scale = this.game.view.scale;
        const width = this.width * scale;
        const height = this.height * scale;

        return hitX >= screenPos.x & hitX <= screenPos.x + width & hitY >= screenPos.y & hitY <= screenPos.y + height;
    }
} 