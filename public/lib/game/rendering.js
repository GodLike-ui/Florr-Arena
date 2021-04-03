// calculates position relative to you
function calculateRelPos(pos, axis) {
    if (axis === "x") return window.innerWidth / 2 + pos * res - me.info.x * res;
    return window.innerHeight / 2 - pos * res + me.info.y * res;
}
// ~~Stole~~ borrowed this from stackoverflow.
// Thanks
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
}

function drawGrid() {
    ctx.strokeStyle = "#000000";
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 0.5;
    let bruh = gridSpace * res;

    gridSetter = (window.innerWidth / 2 - me.info.x * res % bruh) % bruh - 25 * res;
    while (gridSetter <= window.innerWidth) {
        ctx.beginPath();
        ctx.moveTo(gridSetter, 0);
        ctx.lineTo(gridSetter, window.innerHeight);
        ctx.stroke();
        gridSetter += bruh;
    }
    gridSetter = (window.innerHeight / 2 + me.info.y * res % bruh) % bruh - 25 * res;
    while (gridSetter <= window.innerHeight) {
        ctx.beginPath();
        ctx.moveTo(0, gridSetter);
        ctx.lineTo(window.innerWidth, gridSetter);
        ctx.stroke();
        gridSetter += bruh;
    }
    ctx.globalAlpha = 1;
}

function drawMap() {
    ctx.fillStyle = "#1ea761";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "#1b9657";
    if (me.info.x < window.innerWidth / 2 / res) ctx.fillRect(0, 0, (window.innerWidth / 2 / res - me.info.x - 25) * res, window.innerHeight);
    if (me.info.y < window.innerHeight / 2 / res) ctx.fillRect(0, window.innerHeight - ((window.innerHeight / 2 / res - me.info.y - 25) * res), window.innerWidth, (window.innerHeight / 2 / res - me.info.y - 25) * res);
    if (me.info.x > me.roomInfo.x - window.innerWidth / 2 / res) ctx.fillRect(window.innerWidth - ((window.innerWidth / 2 / res - 25 - (me.roomInfo.x - me.info.x)) * res), 0, (window.innerWidth / 2 / res + 25 - (me.roomInfo.x - me.info.x)) * res, window.innerHeight)
    if (me.info.y > me.roomInfo.y - window.innerHeight / 2 / res) ctx.fillRect(0, 0, window.innerWidth, (me.info.y - 25 - (me.roomInfo.y - window.innerHeight / 2 / res)) * res);
}

function drawHelper() {
    if (!(me.settings.helper && !me.settings.keyboard)) return;
    let d = Math.sqrt(
        Math.pow(me.info.mouseX - window.innerWidth / 2, 2) + 
        Math.pow(me.info.mouseY - window.innerHeight / 2, 2)
    )
    ctx.globalAlpha = 0.2 * ((d / res / 200 > 1) ? 1 : (d / res / 200));
    ctx.lineWidth = 17.5 * res;

    let start = {
        x: me.info.mouseX - window.innerWidth / 2,
        y: me.info.mouseY - window.innerHeight / 2
    };
    if (start.x === 0) {
        start.y /= Math.abs(me.info.mouseY - window.innerHeight / 2);
    } else {
        start.x /= Math.abs(me.info.mouseX - window.innerWidth / 2);
        start.y /= Math.abs(me.info.mouseX - window.innerWidth / 2);
    }

    let distance = Math.sqrt(Math.pow(start.x, 2) + Math.pow(start.y, 2));
    start.x /= distance;
    start.y /= distance;
    start.x *= 30;
    start.y *= 30;

    ctx.beginPath();
    ctx.moveTo(window.innerWidth / 2 + start.x, window.innerHeight / 2 + start.y);
    ctx.lineTo(me.info.mouseX, me.info.mouseY);
    ctx.stroke();

    ctx.globalAlpha = 1;
}

function drawMinimap() {
    ctx.globalAlpha = 0.25;

    // Border
    ctx.fillStyle = "#30443a";
    ctx.beginPath();
    ctx.roundRect(
        window.innerWidth - mmWidth - 56 * res, 
        window.innerHeight - mmHeight - 56 * res,
        mmWidth + 12 * res, 
        mmHeight + 12 * res, 
        6
    )
    ctx.fill();

    // Interior
    ctx.fillStyle = "#1ea660";
    ctx.roundRect(
        window.innerWidth - mmWidth - 50 * res, 
        window.innerHeight - mmHeight - 50 * res, 
        mmWidth, 
        mmHeight, 
        6
    );
    ctx.fill();
    ctx.closePath();

    // Yellow circle
    let circlePos = {
        x: (window.innerWidth - 50 * res - (mmWidth + circlePlane.x) / 2) + (me.info.x / me.roomInfo.x * circlePlane.x),
        y: (window.innerHeight - 50 * res - (mmHeight + circlePlane.y) / 2) + (circlePlane.y - me.info.y / me.roomInfo.y * circlePlane.y)
    }

    ctx.beginPath();
    ctx.fillStyle = "#dddc62";
    ctx.arc(circlePos.x, circlePos.y, circleRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath()

    ctx.fillStyle = "#dddd63";
    ctx.beginPath();
    if (circleRadius - 4 > 0) {
        ctx.arc(circlePos.x, circlePos.y, circleRadius - 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.closePath();

    ctx.globalAlpha = 1;
}

function renderPlayer(data, i) {
    if (!i) {
        let p = new Player(data.name, window.innerWidth / 2, window.innerHeight / 2, gridSpace / 2 * res, data.petals);
        p.draw(false);
    } else {
        let p = new Player(data.name, calculateRelPos(data.x, "x"), calculateRelPos(data.y, "y"), gridSpace / 2 * res, data.petals);
        p.draw(true);
    }
}

function drawPerformance() {
    if (!performance.hidden) {
        ctx.globalAlpha = 0.5;
        ctx.font = `${15 * res}px Ubuntu`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(
            `Ping: ${Math.round(performance.ping.ping * 100) / 100} ms`, 
            window.innerWidth * 29/30, 
            window.innerHeight * 1/30
        );
        ctx.fillText(
            `FPS: ${Math.round(performance.fps.fps * 100) / 100}`, 
            window.innerWidth * 29/30, 
            window.innerHeight * 1.8/30
        );
        ctx.globalAlpha = 1;
    }
}