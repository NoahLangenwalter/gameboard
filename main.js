import { Card } from "./card.js";
import { Deck } from "./deck.js";
import { Game } from "./game.js";

window.onload = function () {
    const mouse = { x: 0, y: 0, oldX: 0, oldY: 0, leftButton: false, rightButton: false, lastDown: Date.now() };
    var dragging = null;
    const gridLimit = 64;
    const gridSize = 128;
    
    const boardCanvas = document.getElementById('board');
    const ctx = boardCanvas.getContext("2d");
    boardCanvas.width = window.innerWidth;
    boardCanvas.height = window.innerHeight;

    const game = new Game(boardCanvas, ctx);
    game.objects.push(new Deck(game, 4, 0, 0));

    function animate() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

        game.update();

        game.view.apply(); // set the 2D context transform to the view
        drawGrid(gridSize);

        game.draw(ctx);

        drawPoint(mouse.x, mouse.y);

        requestAnimationFrame(animate);
    }

    function handleLeftClick(e) {
        console.log("handleLeftClick");
        let touched = detectTouch(e);
        if (touched) {
            touched.activate();
        }
    }

    function detectTouch(e) {
        var touchedObject = null;
        let index = 0;
        while (touchedObject === null & index < game.objects.length) {
            if (game.objects[index].detectHit(e.clientX, e.clientY)) {
                touchedObject = game.objects[index];
                console.log("touched: " + touchedObject);
            }
            index = index + 1;
        }

        return touchedObject;
    }

    function onMouseDown(event) {
        updateMouse(event);
        if (mouse.leftButton | mouse.rightButton) {
            return;
        }

        mouse.lastDown = Date.now();

        mouse.leftButton = event.button === 0;
        mouse.rightButton = event.button === 2;

        if (mouse.leftButton) {
            let touched = detectTouch(event);
            if (touched !== null) {
                dragging = touched;
                dragging.pickUp(event);
            }
        }
    }

    function onMouseUp(event) {
        updateMouse(event);
        let clicked = false;
        if (Date.now() - mouse.lastDown < 125) {
            clicked = true;
        }

        if (mouse.leftButton) {
            if (dragging !== null) {
                dragging.putDown();
                dragging = null;
            }
            if (clicked) {
                handleLeftClick(event);
            }
        }

        mouse.leftButton = mouse.rightButton = false;
    }

    function onMouseOut(event) {
        updateMouse(event);
        mouse.leftButton = mouse.rightButton = false;
        mouse.x = -1;
        mouse.y = -1;
    }

    function onMouseMove(event) {
        mouse.oldX = mouse.x;
        mouse.oldY = mouse.y;

        updateMouse(event);

        if (mouse.leftButton & dragging !== null) {
            dragging.drag(event);
        }
        else if (mouse.rightButton) {
            game.view.pan({ x: mouse.x - mouse.oldX, y: mouse.y - mouse.oldY });
        }
    }

    function updateMouse(event) {
        const bounds = boardCanvas.getBoundingClientRect();
        mouse.x = event.pageX - bounds.left - scrollX;
        mouse.y = event.pageY - bounds.top - scrollY;
    }

    function onMouseWheel(event) {
        updateMouse(event);
        var x = mouse.x;
        var y = mouse.y;
        if (event.deltaY < 0 & game.view.scale < game.view.maxZoom) {
            game.view.scaleAt({ x, y }, 1.1);
        }
        else if (game.view.scale > game.view.minZoom) {
            game.view.scaleAt({ x, y }, 1 / 1.1);
        }
        event.preventDefault();
    }

    function resize(event) {
        boardCanvas.width = window.innerWidth;
        boardCanvas.height = window.innerHeight;
        game.view.scaleAt({ x: 0, y: 0 }, 1);
    }

    function drawGrid(gridScreenSize = 128) {
        var scale, gridScale, size, x, y, limitedGrid = false;
        scale = 1 / game.view.scale;
        gridScale = 2 ** (Math.log2(gridScreenSize * scale) | 0);
        size = Math.max(boardCanvas.width, boardCanvas.height) * scale + gridScale * 2;
        x = ((-game.view.position.x * scale - gridScale) / gridScale | 0) * gridScale;
        y = ((-game.view.position.y * scale - gridScale) / gridScale | 0) * gridScale;

        game.view.apply();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#CEF";
        ctx.beginPath();
        for (var i = 0; i < size; i += gridScale) {
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i, y + size);
            ctx.moveTo(x, y + i);
            ctx.lineTo(x + size, y + i);
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset the transform so the lineWidth is 1
        ctx.stroke();

        info.textContent = "Scale: 1px = " + (1 / game.view.scale).toFixed(4) + " world px ";
    }

    function drawPoint(x, y) {
        const worldCoord = game.view.toWorld(x, y);
        game.view.apply();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(worldCoord.x - 10, worldCoord.y);
        ctx.lineTo(worldCoord.x + 10, worldCoord.y);
        ctx.moveTo(worldCoord.x, worldCoord.y - 10);
        ctx.lineTo(worldCoord.x, worldCoord.y + 10);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.stroke();
    }

    boardCanvas.addEventListener("mousedown", onMouseDown, { passive: true });
    boardCanvas.addEventListener("mouseup", onMouseUp, { passive: true });
    boardCanvas.addEventListener("mouseout", onMouseOut, { passive: true });
    boardCanvas.addEventListener("wheel", onMouseWheel, { passive: false });
    boardCanvas.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", resize);

    animate();
}