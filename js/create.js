import { Card } from './card.js';
import { Deck } from './deck.js';

export class Create {
    #selected = "NONE";

    constructor(game) {
        this.game = game;

        document.getElementById("createToggleButton").addEventListener("click", this.toggleCreateMenu);
        this.cardButton = document.getElementById("createCardButton");
        this.cardButton.addEventListener("click", this.handleCardClick);
        this.deckButton = document.getElementById("createDeckButton");
        this.deckButton.addEventListener("click", this.handleDeckClick);
        this.boardButton = document.getElementById("createBoardButton");
        this.boardButton.addEventListener("click", this.handleBoardClick);
    }

    get selected() { return this.#selected != "NONE" }

    toggleCreateMenu = () => {
        this.clearSelection();
        document.getElementById("createPane").classList.toggle("open");
    }

    clearSelection() {
        this.cardButton.classList.remove("selected");
        this.deckButton.classList.remove("selected");
        this.boardButton.classList.remove("selected");

        this.#selected = "NONE";

        this.cardButton.blur();
        this.deckButton.blur();
        this.boardButton.blur();
    }

    handleCardClick = () =>  {
        this.clearSelection();
        this.#selected = "CARD";
        this.cardButton.classList.add("selected");
        this.game.enterCreateMode();
    }

    handleDeckClick = () =>  {
        this.clearSelection();
        this.#selected = "DECK";
        this.deckButton.classList.add("selected");
        this.game.enterCreateMode();
    }

    handleBoardClick = () => {
        this.clearSelection();
        this.#selected = "BOARD";
        this.boardButton.classList.add("selected");
        this.game.enterCreateMode();
    }

    completeCreationAt(screenPos) {
        const worldPos = this.game.view.toWorld(screenPos.x, screenPos.y);

        if (this.#selected === "CARD") {
            this.createCardAt(worldPos);
        }
        else if (this.#selected === "DECK") {
            this.createDeckAt(worldPos);
        }
        else if (this.#selected === "BOARD") {

        }

        this.clearSelection();
    }

    createCardAt(worldPos) {
        worldPos.x -= 250/ 2; //TODO: Refactor?
        worldPos.y -= 350/ 2;
        const card = new Card(this.game, "", true, worldPos.x, worldPos.y, this.game.nextZ);
        this.game.addObject(card);

        setTimeout(() => {
            this.game.enterEditMode();
        }, 100);
    }

    createDeckAt(worldPos) {
        worldPos.x -= 250/ 2; //TODO: Refactor?
        worldPos.y -= 350/ 2;
        const deck = new Deck(this.game, false, worldPos.x, worldPos.y, this.game.nextZ);
        this.game.addObject(deck);
    }
}