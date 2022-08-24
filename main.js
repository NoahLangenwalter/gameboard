import { Card } from "./card.js";
import { Deck, DeckType } from "./deck.js";
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

        mouse.update();
        // info.textContent += "Mouse: " + mouse.x.toFixed(2) + "," + mouse.y.toFixed(2) + " - ";

        game.draw();

        // mouse.draw();

        requestAnimationFrame(animate);
    }

    function resize(event) {
        boardCanvas.width = window.innerWidth;
        boardCanvas.height = window.innerHeight;
        // game.view.scaleAt({ x: 0, y: 0 }, 1);
    }

    function startGame() {
        const discard = new Deck(game, DeckType.DiscardPile, 0, 650, 250, 0);
        const drawPile = new Deck(game, DeckType.DrawPile, 4, 250, 250, 1)
        game.addObject(discard);
        game.addObject(drawPile);
        game.addObject(new Card(game, "A", 1050, 200, 2));
        game.addObject(new Card(game, "B", 1050, 240, 3));
        game.addObject(new Card(game, "C", 1050, 280, 4));
        game.addObject(new Card(game, "D", 1050, 320, 5));
        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);

    startGame();
}