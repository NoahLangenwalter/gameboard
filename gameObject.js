export class GameObject {
    width = 100;
    height = 100;
    cornerRadius = 20;
    dragOffset = { x: 0, y: 0 };
    
    constructor(game, startX = 0, startY = 0, startZ = 0) {
        this.game = game;
        this.x = startX;
        this.y = startY;
        this.z = startZ;
    }

    activate() {
        // console.log("Activated: " + this);
    }

    pickUp(event) {
        console.log("pickUp");
        this.dragging = true;
        this.dragOffset.x = event.clientX - this.x;
        this.dragOffset.y = event.clientY - this.y;
    }

    putDown() {
        console.log("putDown");
        this.dragging = false;
        this.dragOffset = {x: 0, y: 0};
    }

    drag(event) {
        console.log("drag");
        this.x = event.pageX - this.dragOffset.x;
        this.y = event.pageY - this.dragOffset.y;
    }

    update() {
        // console.log("Updated: " + this);
    }

    draw(context) {
        const scale = this.game.view.scale;

        let x = (this.game.view.position.x * scale) + this.x;
        let y = (this.game.view.position.y * scale) + this.y;
        // this.game.view.apply();
        // context.setTransform(1, 0, 0, 1, 0, 0);
        context.fillStyle = "red";
        context.fillRect(x, y, this.width * scale, this.height * scale);
        // // context.setTransform(1, 0, 0, 1, 0, 0);

        // // this.game.view.apply();
        // let cR = this.cornerRadius;
        // context.fillStyle = "red";
        // context.strokeStyle = "red";
        // context.lineJoin = "round";
        // context.lineWidth = cR;
        // context.strokeRect(worldCoords.x+(cR/2), worldCoords.y+(cR/2), this.width-cR, this.height-cR);
        // context.fillRect(worldCoords.x+(cR/2), worldCoords.y+(cR/2), this.width-cR, this.height-cR);
        // // context.setTransform(1, 0, 0, 1, 0, 0);
        // context.strokeStyle = "white";
        // context.lineWidth = 8;
        // context.strokeRect(worldCoords.x+15, worldCoords.y+15, this.width-30, this.height-30);
        
        // this.game.view.apply();
        // context.beginPath();
        // context.moveTo(worldCoords.x+15,worldCoords.y+15);
        // context.lineTo(worldCoords.x+this.width-15,worldCoords.y+this.height-15);
        // context.stroke();

        // this.game.view.apply();
        // context.beginPath();
        // context.moveTo(worldCoords.x+15,worldCoords.y+this.height-15);
        // context.lineTo(worldCoords.x+this.width-15,worldCoords.y+15);
        // // context.setTransform(1, 0, 0, 1, 0, 0);
        // context.stroke();
    }

    detectHit(hitX, hitY) {
        const worldCoords = this.game.view.toWorld(hitX, hitY);
        const scale = this.game.view.scale;

        let x = (this.game.view.position.x * scale) + this.x;
        let y = (this.game.view.position.y * scale) + this.y;
        let width = this.width * scale;
        let height = this.height * scale;

        return worldCoords.x >= x & worldCoords.x <= x + width & worldCoords.y >= y & worldCoords.y <= y + height;
    }
} 