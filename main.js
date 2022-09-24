import { Card } from "./js/card.js";
import { Deck } from "./js/deck.js";
import { Die } from "./js/die.js";
import { Note } from "./js/note.js";
import { Game } from "./js/game.js";
import { Mouse } from "./js/mouse.js";
import { Keyboard } from "./js/keyboard.js";
import { Create } from "./js/create.js";


window.onload = function () {

    const boardCanvas = document.getElementById("board");
    const ctx = boardCanvas.getContext("2d");
    boardCanvas.width = window.innerWidth;
    boardCanvas.height = window.innerHeight;
    const game = new Game(boardCanvas, ctx);
    const create = new Create(game);
    game.creator = create;
    const mouse = new Mouse(game);
    const keyboard = new Keyboard(game, mouse, saveState);

    function animate() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

        game.update();
        mouse.update();
        keyboard.update();
        // info.textContent += "Mouse: " + mouse.x.toFixed(2) + "," + mouse.y.toFixed(2) + " - ";

        game.draw();
        mouse.draw();

        requestAnimationFrame(animate);
    }

    function startGame() {
        document.getElementById("saveButton").addEventListener("click", saveState);

        const savedState = localStorage.getItem("boardState");
        if (savedState) {

            const state = JSON.parse(savedState);
            game.view.setUp(state.viewOffset, state.scale);

            state.objects.forEach(obj => {
                const original_class = eval(obj.className);

                const classedObj = new original_class(game);

                classedObj.deserialize(obj);

                game.addObject(classedObj, classedObj.z);
            });
        }

        requestAnimationFrame(animate);
    }

    function saveState() {
        const stateObj = { scale: game.view.scale, viewOffset: game.view.offset, objects: [] };
        let serializedState = JSON.stringify(stateObj);

        if (game.objects.length > 0) {
            let serializedObjects = "[";
            game.objects.forEach(obj => {
                serializedObjects += obj.serialize() + ",";
            });
            serializedObjects = serializedObjects.slice(0, -1);
            serializedObjects += "]";

            serializedState = serializedState.replace("[]", serializedObjects);
        }

        localStorage.setItem('boardState', serializedState);

        const date = new Date();
        // info.textContent = "Saved at: " + date.toISOString();
    }

    function resize() {
        boardCanvas.width = window.innerWidth;
        boardCanvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resize);

    startGame();
}