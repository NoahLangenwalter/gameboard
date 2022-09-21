import { DrawOrientation, DrawSpacing } from "./deck.js";
import { Mode } from "./game.js";


export class Keyboard {
    key;
    reservedCombos = ["KeyS", "KeyF", "KeyE", "KeyD", "Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0"];
    ignored = ["ControlLeft", "ControlRight", "ShiftLeft", "ShiftRight"];
    numerics = ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
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
            else if (event.code === "KeyA" && event.ctrlKey) {
                event.preventDefault();
                this.game.selectAll();
            }
            else if (event.code === "KeyS" && event.ctrlKey) {
                this.shuffleValidTargets();
            }
            else if (event.code === "KeyF" && event.ctrlKey) {
                this.flipValidTargets();
            }
            else if (event.code === "Delete") {
                this.deleteValidTargets();
            }
            else if (this.mouse.isTargeting) {
                this.handleTargetingCommands(event);
            }
        }
        else if (this.game.mode === Mode.Create) {
            if (event.code === "Escape") {
                this.game.cancelCreate();
            }
        }
    }

    handleTargetingCommands(event) {
        if (event.code === "KeyD" && event.ctrlKey) {
            this.mouse.performTargetedAction();
        }
        else if (event.code === "Escape") {
            this.mouse.cancelTargeting();
        }
        else if (this.numerics.includes(event.key)) {
            if (event.key === "`") {
                this.mouse.drawCount = 0;
            }
            else if (event.key === "0") {
                this.mouse.drawCount = 10;
            }
            else {
                this.mouse.drawCount = parseInt(event.key);
            }
        }
        else if (event.code.startsWith("Arrow")) {
            if (event.code.includes("Up")) {
                this.mouse.targetOrientation = DrawOrientation.Vertical;
                this.mouse.targetSpacing = DrawSpacing.Spread;
            }
            else if (event.code.includes("Down")) {
                this.mouse.targetOrientation = DrawOrientation.Vertical;
                this.mouse.targetSpacing = DrawSpacing.Stacked;
            }
            else if (event.code.includes("Right")) {
                this.mouse.targetOrientation = DrawOrientation.Horizontal;
                this.mouse.targetSpacing = DrawSpacing.Spread;
            }
            else if (event.code.includes("Left")) {
                this.mouse.targetOrientation = DrawOrientation.Horizontal;
                this.mouse.targetSpacing = DrawSpacing.Stacked;
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