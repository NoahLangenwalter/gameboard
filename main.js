import { Card } from "./js/card.js";
import { Deck, DeckType } from "./js/deck.js";
import { Game } from "./js/game.js";
import { Mouse } from "./js/mouse.js";
import { Keyboard } from "./js/keyboard.js";

window.onload = function () {

    const boardCanvas = document.getElementById("board");
    const ctx = boardCanvas.getContext("2d");
    boardCanvas.width = window.innerWidth;
    boardCanvas.height = window.innerHeight;
    const game = new Game(boardCanvas, ctx);
    const mouse = new Mouse(game);
    const keyboard = new Keyboard(game, mouse);

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
        keyboard.update();

        requestAnimationFrame(animate);
    }

    function resize(event) {
        boardCanvas.width = window.innerWidth;
        boardCanvas.height = window.innerHeight;
        // game.view.scaleAt({ x: 0, y: 0 }, 1);
    }

    function startGame() {
        // const discard = new Deck(game, DeckType.DiscardPile, 4, 650, 250, 0);
        // const drawPile = new Deck(game, DeckType.DrawPile, 4, 250, 250, 1)
        // game.addObject(discard);
        // game.addObject(drawPile);
        // game.addObject(new Card(game, "A", 1050, 200, 2));
        // game.addObject(new Card(game, "B", 1050, 240, 3));
        // game.addObject(new Card(game, "supercalifragilisticexpialidocious!", 0, 0, 5));
        loadPlayingCards();

        requestAnimationFrame(animate);
    }

    function loadPlayingCards() {
        const discard = new Deck(game, DeckType.DiscardPile, 0, 650, 250, 0);
        const drawPile = new Deck(game, DeckType.DrawPile, 0, 250, 250, 1)

        const suits = ["❤️", "♠️", "🔶", "♣️"];
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

        suits.forEach(suit => {
            values.forEach(value => {
                const content = value + "\n" + suit;
                const card = new Card(game, content);
                drawPile.returnCard(card); 
            });
        });

        drawPile.shuffle();

        game.addObject(discard);
        game.addObject(drawPile);

    }

    window.addEventListener("resize", resize);

    startGame();
}