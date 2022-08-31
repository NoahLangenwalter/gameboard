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
        if(this.ignored.includes(event.code)) {
            return;
        }

        if(event.ctrlKey && this.reservedCombos.includes(event.code)) {
            event.preventDefault();
        }
        
        if (this.game.mode === Mode.Play) {
            if (event.code === "KeyE" && event.ctrlKey) {
                event.preventDefault();
                this.game.enterEditMode();
            }
            else if(event.code === "KeyS" && event.ctrlKey) {
                if(this.mouse.isHovering && this.mouse.hoverTarget.isShuffleable) {
                    this.mouse.hoverTarget.shuffle();
                }
            }
            else if(event.code === "KeyF" && event.ctrlKey) {
                if(this.mouse.isHovering) { //isFlippable
                    this.mouse.hoverTarget.activate();
                }
            }
        }
        // else if (this.game.mode === Mode.Edit) {
        //     let newContent = "";
        //     if (event.key === "Backspace") {
        //         this.game.editTarget.content = this.game.editTarget.content.slice(0, -1);
        //         return;
        //     }

        //     if (this.keyIsTextCharacter(event)) {
        //         newContent = event.key;
        //     }
        //     else if (event.key === "Enter") {
        //         newContent = "\n"
        //     }

        //     this.game.editTarget.content += newContent;
        // }
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

    keyIsTextCharacter(event) {
        // cosnt ['+', '(', ')', '-', 'ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'].includes(key)
        if (event.code.startsWith("Key") || event.code.startsWith("Digit") || event.key === " ") { return true; }
    }
}