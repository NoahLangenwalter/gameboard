export class Editor {
    editObj = null;
    constructor(game) {
        this.game = game;
        this.editContainer = document.getElementById("editContainer");
        this.editBox = document.getElementById("editBox");
        // this.editText = document.getElementById("editText");
        // this.final = document.getElementById("final");
        // document.execCommand("defaultParagraphSeparator", false, "");
    }

    start(object) {
        this.editObj = object;

        const scale = this.game.view.scale;
        const position = this.game.view.toScreen(object.x, object.y);
        this.editContainer.style.display = "flex";
        this.editContainer.style.left = position.x
        this.editContainer.style.top = position.y;
        this.editContainer.style.width = object.width * scale;
        this.editContainer.style.height = object.height * scale;

        this.editBox.style.transform = `scale(${scale})`;

        this.editBox.style.fontSize = object.fontSize;
        this.editBox.style.lineHeight = object.lineHeight + "px";
        const paddingX = (object.width - object.maxTextWidth) / 2;
        const paddingY = (object.height - object.maxTextHeight) / 2;
        this.editBox.style.padding = paddingY + "px " + paddingX + "px";
        this.editBox.style.minWidth = this.editBox.style.width = object.width;
        this.editBox.style.top = `-${7*scale}px`;
        // this.editBox.style.minHeight = object.fontSize * object.lineCount;

        this.editBox.innerText = object.content;

        object.startEdit();

        this.editBox.focus();

        setTimeout(() => {
            const selection = window.getSelection();
            selection.selectAllChildren(this.editBox);
            selection.collapseToEnd();
            if(this.editBox.firstChild.nodeName === "DIV") {
                this.editBox.removeChild(this.editBox.firstChild);
            }
            this.editBox.addEventListener("input", this.onInput);
        }, 0);
    }

    end() {
        this.editContainer.style.display = "none";
        this.editBox.innerText = "";

        this.editObj.endEdit();

        this.editBox.removeEventListener("input", this.onInput);

        document.activeElement.blur();
        this.game.canvas.focus();
    }

    onInput = (event) => {
        this.editObj.content = this.editBox.innerText.replace(/\n\n/g, "\n");

        this.editBox.style.fontSize = this.editObj.fontSize;
        this.editBox.style.lineHeight = this.editObj.lineHeight + "px";
        // this.editBox.style.minHeight = this.editObj.fontSize * this.editObj.lineCount;
    }
} 