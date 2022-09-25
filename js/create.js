import { Card } from './card.js';
import { Deck } from './deck.js';
import { Note } from './note.js';
import { Die } from './die.js';

export class Create {
    #selected = "NONE";

    constructor(game) {
        this.game = game;

        document.getElementById("createToggleButton").addEventListener("click", this.toggleCreateMenu);
        this.noteButton = document.getElementById("createNoteButton");
        this.noteButton.addEventListener("click", this.handleNoteClick);
        this.cardButton = document.getElementById("createCardButton");
        this.cardButton.addEventListener("click", this.handleCardClick);
        this.emptyDeckButton = document.getElementById("createEmptyDeckButton");
        this.emptyDeckButton.addEventListener("click", this.handleEmptyDeckClick);
        this.playingCardDeckButton = document.getElementById("createPlayingCardDeckButton");
        this.playingCardDeckButton.addEventListener("click", this.handlePlayingCardDeckClick);
        this.dieButton = document.getElementById("createDieButton");
        this.dieButton.addEventListener("click", this.handleDieClick);
        this.boardButton = document.getElementById("createBoardButton");
        this.boardButton.addEventListener("click", this.handleBoardClick);

        this.dieSides = 6;

        this.diePane = document.getElementById("diePane");

        for (const button of this.diePane.children) {
            button.addEventListener("click", this.handleDieOptionClick);
        }
    }

    get selected() { return this.#selected != "NONE" }

    toggleCreateMenu = () => {
        this.clearSelection();
        document.getElementById("createPane").classList.toggle("open");
    }

    clearSelection() {
        this.noteButton.classList.remove("selected");
        this.cardButton.classList.remove("selected");
        this.emptyDeckButton.classList.remove("selected");
        this.playingCardDeckButton.classList.remove("selected");
        this.dieButton.classList.remove("selected");
        this.diePane.classList.remove("open");
        this.boardButton.classList.remove("selected");

        this.#selected = "NONE";

        this.noteButton.blur();
        this.cardButton.blur();
        this.emptyDeckButton.blur();
        this.playingCardDeckButton.blur();
        this.dieButton.blur();
        this.boardButton.blur();
    }

    handleNoteClick = () => {
        this.clearSelection();
        this.#selected = "NOTE";
        this.noteButton.classList.add("selected");
        this.game.enterCreateMode();
    }

    handleCardClick = () => {
        this.clearSelection();
        this.#selected = "CARD";
        this.cardButton.classList.add("selected");
        this.game.enterCreateMode();
    }

    handleEmptyDeckClick = () => {
        this.clearSelection();
        this.#selected = "EMPTY_DECK";
        this.emptyDeckButton.classList.add("selected");
        this.game.enterCreateMode();
    }

    handlePlayingCardDeckClick = () => {
        this.clearSelection();
        this.#selected = "PLAYING_CARD_DECK";
        this.playingCardDeckButton.classList.add("selected");
        this.game.enterCreateMode();
    }

    handleDieClick = () => {
        this.clearSelection();
        this.#selected = "DIE";
        this.dieButton.classList.add("selected");
        this.diePane.classList.add("open");
        this.game.enterCreateMode();
    }

    handleBoardClick = () => {
        this.clearSelection();
        this.#selected = "BOARD";
        this.boardButton.classList.add("selected");
        this.game.enterCreateMode();
    }

    handleDieOptionClick = (e) => {
        this.dieSides = parseInt(e.currentTarget.value);
        for (const button of this.diePane.children) {
            button.classList.remove("selected");
        }

        e.currentTarget.classList.add("selected");
    }

    completeCreationAt(screenPos) {
        const worldPos = this.game.view.toWorld(screenPos.x, screenPos.y);

        if (this.#selected === "NOTE") {
            this.createNoteAt(worldPos);
        }
        else if (this.#selected === "CARD") {
            this.createCardAt(worldPos);
        }
        else if (this.#selected === "EMPTY_DECK") {
            this.createDeckAt(worldPos);
        }
        else if (this.#selected === "PLAYING_CARD_DECK") {
            this.createPlayingCardDeckAt(worldPos);
        }
        else if (this.#selected === "DIE") {
            this.createDieAt(worldPos);
        }
        else if (this.#selected === "BOARD") {
        }

        this.clearSelection();
    }

    createNoteAt(worldPos) {
        worldPos.x -= 300 / 2; //TODO: Refactor?
        worldPos.y -= 300 / 2;
        const note = new Note(this.game, "", 300, 300, worldPos.x, worldPos.y, this.game.nextZ);
        this.game.addObject(note);

        setTimeout(() => {
            this.game.enterEditMode();
        }, 100);
    }

    createCardAt(worldPos) {
        worldPos.x -= 250 / 2; //TODO: Refactor?
        worldPos.y -= 350 / 2;
        const card = new Card(this.game, "", true, worldPos.x, worldPos.y, this.game.nextZ);
        this.game.addObject(card);

        setTimeout(() => {
            this.game.enterEditMode();
        }, 100);
    }

    createDeckAt(worldPos) {
        worldPos.x -= 250 / 2; //TODO: Refactor?
        worldPos.y -= 350 / 2;
        const deck = new Deck(this.game, false, worldPos.x, worldPos.y, this.game.nextZ);
        this.game.addObject(deck);
    }

    createDieAt(worldPos) {
        worldPos.x -= 60 / 2; //TODO: Refactor?
        worldPos.y -= 60 / 2;
        const die = new Die(this.game, this.dieSides, worldPos.x, worldPos.y, this.game.nextZ);
        this.game.addObject(die);
    }

    createPlayingCardDeckAt(worldPos) {
        worldPos.x -= 250 / 2; //TODO: Refactor?
        worldPos.y -= 350 / 2;

        const drawPile = new Deck(this.game, false, worldPos.x, worldPos.y, this.game.nextZ);
        this.game.addObject(drawPile);

        const suits = ["❤️", "♣️", "🔶", "♠️"];
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

        const cards = [];

        suits.forEach(suit => {
            values.forEach(value => {
                const content = value + "\n" + suit;
                const card = new Card(this.game, content, false, worldPos.x, worldPos.y);
                cards.push(card);
            });
        });

        drawPile.loadCards(cards);
    }
}