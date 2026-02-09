import WebSocket, { WebSocketServer } from "ws";
import connect from "connect";
import serveStatic from "serve-static";
import http from "http";
import finalhandler from "finalhandler";
import { spawn } from "child_process";
import { promises as fs } from "fs";

const Config = {
    WebSocketServerPort: 8081,
    WebServerPort: 8080,
};

const wss = new WebSocketServer({ port: Config.WebSocketServerPort });

wss.on("listening", function () {
    console.log(`WebSocketServer is listening on port ${Config.WebSocketServerPort}`);
});
wss.on("connection", function (ws) {
    console.log("WebSocket connection received");
    
    // const child = spawn("jconsole");
    const child = spawn("jconsole", [], {shell:true});
    
    child.stdout.on("data", (data) => {
        let message = data.toString();
        
        let code = parseInt(message, 10);
        if(Number.isNaN(code)) {
            console.error("Malformed response from J:", message);
        }
        else if(code === 0) {
            // all good
            fs.readFile("tmp.out").then(data => {
                let dataStr = data.toString();
                console.log("J says:", JSON.stringify(dataStr));
                ws.send(JSON.stringify({ output: dataStr }));
            });
        }
        else {
            console.error("J errored with code:", code);
        }
    });

    child.stderr.on("data", (data) => {
        console.error(`Error: ${data.toString()}`);
    });


    child.on("close", (code) => {
        console.log(`Child process exited with code ${code}`);
    });
    
    child.stdin.write("load 'bridge.ijs'\n");
    
    ws.on("error", console.error);

    ws.on("message", function (data) {
        let msg = JSON.parse(data.toString());
        let jInstruction = `parse 0 : 0\n${msg.command}\n)\n`;
        console.log(msg, jInstruction);
        child.stdin.write(jInstruction);
    });
    
    ws.on("close", function (data) {
        console.log("Closed");
        child.kill();
    });
});


const serve = serveStatic("./", { index: ["index.html", "index.htm"] })

// Create server
const server = http.createServer((req, res) => {
    console.log(`GET ${req.url}`);
    serve(req, res, finalhandler(req, res))
});

server.listen(Config.WebServerPort);
