import { Card } from "./card.js";
import { Deck } from "./deck.js";
import { Game } from "./game.js";
import { Mouse } from "./mouse.js";

window.onload = function () {

    const boardCanvas = document.getElementById("board");
    const ctx = boardCanvas.getContext("2d");
    boardCanvas.width = window.innerWidth;
    boardCanvas.height = window.innerHeight;
    const game = new Game(boardCanvas, ctx);
    const mouse = new Mouse(game);

    function animate() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

        game.update();
        // info.textContent += "Mouse: " + mouse.x.toFixed(2) + "," + mouse.y.toFixed(2) + " - ";

        game.draw();

        mouse.draw();

        requestAnimationFrame(animate);
    }

    function resize(event) {
        boardCanvas.width = window.innerWidth;
        boardCanvas.height = window.innerHeight;
        // game.view.scaleAt({ x: 0, y: 0 }, 1);
    }

    function startGame() {
        game.objects.push(new Deck(game, 4, 0, 0));
        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);

    startGame();
}