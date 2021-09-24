import {registerStompPromise} from "./websocket-listener.js";
import {idx2color, desaturized_idx2color} from "./color.js";

// global variables for some state.
// FIXME: maybe I should put this in a class or something
const SCALE = 20;
const FOOD = "#cc2200";
const BG_COLOR = "#000";

let W = 10;
let H = 10;
let paused = true;

let stompClientPromise;
const c = document.getElementById("restfulsnake");
let ctx = c.getContext("2d");

// prevent scrolling so that we can use touch events of navigation
c.style.cssText = "touch-action: none;";

function init() {
    // check if we are joining an existing game, or starting a new one
    // https://stackoverflow.com/a/901144
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    const id = params["id"];

    if(id === undefined) {
        fetch("/api/init", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json())
        .then((state) => {
            join(state.id);
        });
    } else {
        join(id);
    }
}

init();

function join(id) {
    let url = window.location.origin + `?id=${id}`;
    document.getElementById("share").innerHTML = `Share this link for others to join: ${url}`;

    stompClientPromise = registerStompPromise([
        {route: '/topic/update/' + id, callback: drawWebSocket},
    ]).then(x => {
        x.send("/app/join", {}, id);
        console.log("stomp", x);
        return x;
    });
}

function move(dir) {
    stompClientPromise.then(x => x.send("/app/move", {}, JSON.stringify(dir)));
}

// listen for keypresses
document.onkeydown = function(e) {
    switch(e.code) {
        case "ArrowUp":
        case "KeyW":
            move("up");
            unpause();
            break;
        case "ArrowDown":
        case "KeyS":
            move("down");
            unpause();
            break;
        case "ArrowLeft":
        case "KeyA":
            move("left");
            unpause();
            break;
        case "ArrowRight":
        case "KeyD":
            move("right");
            unpause();
            break;
        case "KeyP":
            toggle_pause();
            break;
        case "KeyR":
            reset();
            break;
    }
}

// steering using touch gestures
let xDown = null;
let yDown = null;

document.ontouchstart = function(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

document.ontouchmove = function (evt) {
    if(! xDown || ! yDown) {
        return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    // only handle the event, if the swipe started or ended in the canvas
    let r = c.getBoundingClientRect();
    if(
        xUp - r.left > 0
        && yUp - r.top > 0
        && xUp - r.right < 0
        && yUp - r.bottom < 0
        ||     xDown - r.left > 0
        && yDown - r.top > 0
        && xDown - r.right < 0
        && yDown - r.bottom < 0) {
        // we are inside, just pass
    } else {
        // do not steer if the event was outside
        return;
    }

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    // which component is longer
    if(Math.abs(xDiff) > Math.abs(yDiff)) {
        if ( xDiff > 0 ) {
            move("left");
        } else {
            move("right");
        }
    } else {
        if(yDiff > 0) {
            move("up");
        } else {
            move("down");
        }
    }

    unpause();

    xDown = null;
    yDown = null;
};

function reset() {
    stompClientPromise.then(x => x.send("/app/reset", {}, ""));
}

function unpause() {
    if(paused) {
        stompClientPromise.then(x => x.send("/app/unpause", {}, ""));
    }
}

function pause() {
    if(!paused) {
        stompClientPromise.then(x => x.send("/app/pause", {}, ""));
    }
}

function toggle_pause() {
    if(paused) {
        unpause();
    } else {
        pause();
    }
}

function drawWebSocket(message) {
    draw(JSON.parse(message.body))
}

function drawSnake(snake) {
    let color;
    if(snake.dead) {
        color = desaturized_idx2color(snake.idx);
    } else {
        color = idx2color(snake.idx)
    }

    ctx.fillStyle = color;
    let x = snake.head.x;
    let y = snake.head.y;
    if(snake.headDirection === "right") {
        ctx.fillRect(x*SCALE, y*SCALE, SCALE/2, SCALE);
        ctx.fillRect(x*SCALE+SCALE/2., y*SCALE+SCALE/4, SCALE/2., SCALE/2);
    }
    if(snake.headDirection === "left") {
        ctx.fillRect(x*SCALE+SCALE/2., y*SCALE, SCALE/2, SCALE);
        ctx.fillRect(x*SCALE, y*SCALE+SCALE/4, SCALE/2., SCALE/2);
    }
    if(snake.headDirection === "down") {
        ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE/2);
        ctx.fillRect(x*SCALE+SCALE/4., y*SCALE+SCALE/2, SCALE/2., SCALE/2);
    }
    if(snake.headDirection === "up") {
        ctx.fillRect(x*SCALE, y*SCALE+SCALE/2, SCALE, SCALE/2);
        ctx.fillRect(x*SCALE+SCALE/4., y*SCALE, SCALE/2., SCALE/2);
    }

    for(let seg of snake.tail) {
        ctx.fillRect(seg.x*SCALE, seg.y*SCALE, SCALE, SCALE);
    }
}

function draw(state) {
    console.log("draw!", state);
    W = state.width;
    H = state.height;
    c.width = (W * SCALE);
    c.height = (H * SCALE);

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, W*SCALE, H*SCALE);

    ctx.fillStyle = FOOD;
    let x = state.food.x;
    let y = state.food.y;
    ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE);

    state.snakes.forEach(snake => drawSnake(snake));

    if(state.paused) {
        paused = true;
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Paused", W*SCALE/2, H*SCALE/2);
    } else {
        paused = false;
    }

    if(state.gameOver) {
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", W*SCALE/2, H*SCALE/2);
    }

    // show scores
    document.getElementById("score").replaceChildren();
    state.snakes.forEach(snake => {
        let li = document.createElement("LI");
        let textnode = document.createTextNode(`Player ${snake.idx}: Length: ${snake.length}`);
        li.appendChild(textnode);
        li.style = "background-color: " + idx2color(snake.idx);
        document.getElementById("score").appendChild(li);
    })
}

function drawError(text) {
    console.log("draw error!", text);
    console.log(W, H);

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, W*SCALE, H*SCALE);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, W*SCALE/2, H*SCALE/2);

    let textnode = document.createTextNode(`Error: ${text}`);
    document.getElementById("score").appendChild(textnode);
}
