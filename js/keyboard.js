import { Mode } from "./game.js";


export class Keyboard {
    key;
    reservedCombos = ["KeyS", "KeyF", "KeyE", "KeyD"];
    ignored = ["ControlLeft", "ControlRight", "ShiftLeft", "ShiftRight"];
    constructor(game, mouse) {
        this.game = game;
        this.mouse = mouse;

        window.addEventListener("keydown", this.onKeyDown);
        // this.game.canvas.addEventListener("keyup", this.onKeyUp);
    }

    update() {
        // info.textContent = "Last Key Pressed: " + this.key;
    }

    draw() {
    }

    onKeyDown = (event) => {
        this.key = event.key;
        if (this.ignored.includes(event.code)) {
            return;
        }

        if (event.ctrlKey && this.reservedCombos.includes(event.code)) {
            event.preventDefault();
        }

        if (this.game.mode === Mode.Play) {
            if (event.code === "KeyE" && event.ctrlKey) {
                event.preventDefault();
                this.game.enterEditMode();
            }
            else if (event.code === "KeyS" && event.ctrlKey) {
                this.shuffleValidTargets();
            }
            else if (event.code === "KeyF" && event.ctrlKey) {
                this.flipValidTargets();
            }
            else if (event.code === "KeyD" && event.ctrlKey) {
                this.drawFromTarget();
            }
            else if (event.code === "Delete") {
                this.deleteValidTargets();
            }
        }
        else if (this.game.mode === Mode.Create) {
            if (event.code === "Escape") {
                this.game.cancelCreate();
            }
        }
    }

    flipValidTargets() {
        const targets = this.getActionTargets();

        for (let i = 0; i < targets.length; i++) {
            if (targets[i].isFlippable) {
                targets[i].flip();
            }
        }
    }

    shuffleValidTargets() {
        const targets = this.getActionTargets();

        for (let i = 0; i < targets.length; i++) {
            if (targets[i].isShuffleable) {
                targets[i].shuffle();
            }
        }
    }

    deleteValidTargets() {
        const targets = this.getActionTargets();

        for (let i = 0; i < targets.length; i++) {
            this.game.removeObject(targets[i]);
        }
    }

    drawFromTarget() {
        let targetDeck = null;
        if (this.mouse.isHovering && this.mouse.hoverTarget.isCardTarget) {
            targetDeck = this.mouse.hoverTarget;
        }
        else if (this.game.selected.size === 1) {
            targetDeck = this.game.editTarget;
        }

        if (targetDeck !== null && targetDeck.isCardTarget) {
            let endPos = null;
            if (!(this.mouse.isHovering && targetDeck === this.mouse.hoverTarget)) {
                endPos = this.game.view.toWorld(this.mouse.x, this.mouse.y);
            }

            targetDeck.drawCard(endPos);
        }
    }

    getActionTargets() {
        let targets = [];
        if (this.mouse.isHovering && !this.game.isSelected(this.mouse.hoverTarget)) {
            targets.push(this.mouse.hoverTarget);
        }
        else {
            targets = Array.from(this.game.selected);
        }

        return targets;
    }

    // onKeyUp = (event) => {
    //     this.key = event.key;
    //     if(["LeftControl", "RightControl", "LeftShift", "RightShift"].includes(event.code)) {
    //         return;
    //     }

    //     if (this.game.mode === Mode.Edit) {
    //         return;
    //     }


    // }
}