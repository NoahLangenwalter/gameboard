import { Card } from "./js/card.js";
import { Deck } from "./js/deck.js";
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
    const mouse = new Mouse(game, create);
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

        requestAnimationFrame(animate);
    }

    function startGame() {
        // const discard = new Deck(game, true, 4, 650, 250, 0);
        // const drawPile = new Deck(game, false, 4, 250, 250, 1)
        // const discard = new Deck(game, true, 0, 650, 250, 0);
        // const drawPile = new Deck(game, false, 0, 250, 250, 1)
        // game.addObject(discard);
        // game.addObject(drawPile);
        // game.addObject(new Card(game, "A", true, 1050, 200, 2));
        // game.addObject(new Card(game, "B", true, 1050, 240, 3));
        // game.addObject(new Card(game, "supercalifragilisticexpialidocious!", true, 0, 0, 5));

        loadPlayingCards();

        requestAnimationFrame(animate);
    }

    function loadPlayingCards() {
        const centerPos = game.view.toWorld(window.innerWidth / 2, window.innerHeight / 2);
        centerPos.x -= 250 / 2;
        centerPos.y -= 350 / 2
        const drawPile = new Deck(game, false, 0, centerPos.x, centerPos.y, 1)
        game.addObject(drawPile);

        const suits = ["❤️", "♠️", "🔶", "♣️"];
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

        const cards = [];

        suits.forEach(suit => {
            values.forEach(value => {
                const content = value + "\n" + suit;
                const card = new Card(game, content, false, centerPos.x, centerPos.y);
                cards.push(card);
                game.addObject(card);
            });
        });

        drawPile.returnCards(cards);
    }

    function resize() {
        boardCanvas.width = window.innerWidth;
        boardCanvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resize);

    startGame();
}