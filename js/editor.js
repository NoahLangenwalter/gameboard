export class Editor {
    editObj = null;
    constructor(game) {
        this.game = game;
        this.editContainer = document.getElementById("editContainer");
        this.editBox = document.getElementById("editBox");
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
        this.editBox.style.top = `-${7 * scale}px`;

        let splitContent = object.content.split("\n");
        let newHTML = "";

        splitContent.forEach(line => {
            newHTML += `<div>${line === "" ? "<br>" : line}</div>`;
        });

        this.editBox.innerHTML = newHTML;

        object.startEdit();

        this.editBox.focus();

        setTimeout(() => {
            this.moveCaretToEnd();
            this.editBox.addEventListener("input", this.onInput);
            this.editBox.addEventListener('paste', this.onPaste);
        }, 0);
    }

    end() {
        this.editContainer.style.display = "none";
        this.editBox.innerText = "";

        this.editObj.endEdit();

        this.editBox.removeEventListener("input", this.onInput);
        this.editBox.removeEventListener("paste", this.onPaste);

        document.activeElement.blur();
        this.game.canvas.focus();
    }

    updateEditee() {
        let newText = this.editBox.innerHTML;
        if (newText === "<div><br></div>") {
            newText = "";
        }
        else {
            newText = newText.replaceAll("<br>", "");
            newText = newText.replaceAll("</div><div>", "<br>");
            newText = newText.replaceAll("<div></div>", "<br>");
            newText = newText.replaceAll("<div>", "")
            newText = newText.replaceAll("</div>", "")
            newText = newText.replaceAll("<br>", "\n");
            newText = newText.replaceAll("&nbsp;", " ");
        }

        this.editObj.content = newText;

        this.editBox.style.fontSize = this.editObj.fontSize + "px";
        this.editBox.style.lineHeight = this.editObj.lineHeight + "px";
    }

    moveCaretToEnd() {
        const selection = window.getSelection();
        selection.selectAllChildren(this.editBox);
        selection.collapseToEnd();
    }

    onInput = (event) => {
        this.updateEditee();

        //HACK: This is to fix an issue that occurs after removing all text and then writing again.
        //      The first line of text gets no wrapping <div></div>.
        //      This causes a newline to be missed by updateEditee().
        //      A better fix would be to refactor updateEditee() to be more intelligent about enclosing divs and adjacent naked lines. 
        if (this.editBox.innerHTML.length === 1) {
            this.editBox.innerHTML = `<div>${this.editBox.innerHTML}</div>`;
            this.moveCaretToEnd();
        }
        if (this.editBox.innerHTML === "<br><div><br></div>") {
            this.editBox.innerHTML = "<div><br></div><div><br></div>";
            this.moveCaretToEnd();
        }
    }

    onPaste = (event) => {
        // Prevent the default action
        event.preventDefault();

        // Get the copied text from the clipboard
        const text = event.clipboardData
            ? (event.originalEvent || event).clipboardData.getData('text/plain')
            : // For IE
            window.clipboardData
                ? window.clipboardData.getData('Text')
                : '';

        if (document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, text);
        } else {
            // Insert text at the current position of caret
            const range = document.getSelection().getRangeAt(0);
            range.deleteContents();

            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.selectNodeContents(textNode);
            range.collapse(false);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    onKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();

            document.execCommand('insertHTML', false, '<div><br></div>');

            this.updateEditee();
        }
    }
} 