/*  WARNING:
    HORRIBLE MESSY CODE AHEAD
    ENTER AT YOUR OWN RISK */

// Constants
const Room = require("./lib/room.js");
const C = require("./lib/consts.js");
const files = require("./lib/files.js");
const ph = require("./lib/packet-handler.js");

const http = require("http");
const path = require("path");
const fs = require("fs");
const WebSocket = require("ws");


// minifying
const minify = false;

if (minify) {
    console.log("Minifying code...");
    let jsFile = "{";
    files.forEach(file => {
        const filePath = path.join(
            __dirname,
            "public",
            ...file
        );
        let fileCode = fs.readFileSync(filePath, "utf-8");
        if (fileCode[fileCode.length - 1] !== ";") {
            fileCode += ";";
        }
        jsFile += fileCode;
    });
    jsFile += "}";
    var minifiedScript = require("@babel/core").transform(jsFile, {
        presets: ["minify"],
        comments: false 
    }).code
    console.log("Minification complete!");
}

// Server
const server = http.createServer((req, res) => {
    let contentType;
    let file = path.join(
        __dirname,
        "public",
        req.url === "/" ? "stuff.html" 
            : req.url === "/credits" ? "credits.html" 
            : req.url === "/changelog" ? "changelog.html"
            : req.url
    );
    fs.readFile(file, (err, content) => {
        if (err) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("<h1>page not found nub</h1>", "utf8");
        } else {
            switch (path.extname(file)) {
                case ".html": 
                    contentType = "text/html";
                    break;
                case ".js":
                    contentType = "text/javascript";
                    break;
                case ".ico":
                    contentType = "image/x-icon";
                    break;
                case ".css":
                    contentType = "text/css";
                    break;
                case ".png":
                    contentType = "img/png";
                    break;
                case ".svg":
                    contentType = "image/svg+xml";
                    break;
            }
            if (req.url === "/index.js") {
                if (minify) content = minifiedScript;
                else {
                    let jsFile = "{";
                    files.forEach(file => {
                        const filePath = path.join(
                            __dirname,
                            "public",
                            ...file
                        );
                        let fileCode = fs.readFileSync(filePath, "utf-8");
                        if (fileCode[fileCode.length - 1] !== ";") {
                            fileCode += ";";
                        }
                        jsFile += fileCode;
                    });
                    jsFile += "}";
                    content = jsFile;
                }
            }
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
        }
    });
});

// variables
const wss = new WebSocket.Server({ server });
const time = {};
let rooms = new Map().set("", new Room(20, 20));

// When a websocket connects
wss.on('connection', function connection(ws) {

    ws.on('error', console.error);

    let myID;
    let myRoom = "";
    let bruh;
    let myName;
    bruh = false;

    rooms.get("").connected++;
    ws.send(JSON.stringify(["a", "b", "a", "", rooms.get("").info, true]));

    // Closed tab or reloading
    ws.on("close", () => {
        myName = undefined;
        if (myID !== undefined) {
            rooms.get(myRoom).players[myID] = undefined;
            myID = undefined;
        }
        rooms.get(myRoom).connected--;
        if (rooms.get(myRoom).connected === 0 && myRoom !== "") {
            rooms.delete(myRoom);
        }
        myRoom = undefined;
    });

    // Messages being received from that socket
    ws.on('message', function incoming(message) {
        const msg = JSON.parse(message);
        // ph = packet handler
        [myRoom, myID, myName, bruh] = ph(msg, myRoom, myID, myName, rooms, bruh, ws);
    });
});

// Main loop
function mainloop() {
    time.last = Date.now() - time.old;
    const mul = time.last / C.frame;
    rooms.forEach(room => {
        room.update(mul);
    });
    time.old = Date.now();
}

time.old = Date.now();
setInterval(mainloop, C.frame);

const PORT = process.env.PORT || 9700;
server.listen(PORT, console.log(`Server running on port ${PORT}`));