import { Mode } from "./game.js";


export class Keyboard {
    key;
    reservedCombos = ["KeyS", "KeyF", "KeyE"];
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

    getActionTargets(action) {
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