const EmptyResult = Symbol("EmptyResult");

const decode = arr => {
    if(Array.isArray(arr)) {
        let [ shape, ...data ] = arr;
        return { shape, data: data.map(decode) };
    }
    else if(arr) {
        // console.log(arr);
        return {
            shape: null,
            data: arr.match(/.{2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join("")
        };
    }
    else {
        return {
            shape: null,
            data: EmptyResult
        };
    }
};

const htmlEncode = ({ shape, data }) => {
    // console.log("HM:",{shape,data});
    if(shape === null) {
        return [ data === EmptyResult ? "" : data ];
    }
    console.log("Encode table:", shape, data);
    if(shape.length === 0) {
        return htmlEncode({ shape: [1], data });
    }
    else if(shape.length === 1) {
        let table = document.createElement("table");
        let tr = document.createElement("tr");
        data.forEach(cell => {
            let el = htmlEncode(cell);
            let td = document.createElement("td");
            td.append(...el);
            tr.append(td);
        });
        table.append(tr);
        return [ table ];
    }
    else if(shape.length === 2) {
        let table = document.createElement("table");
        let [ colCount, rowCount ] = shape;
        for(let i = 0; i < rowCount * colCount; i += rowCount) {
            let tr = document.createElement("tr");
            data.slice(i, i + rowCount).forEach(cell => {
                let el = htmlEncode(cell);
                let td = document.createElement("td");
                td.append(...el);
                tr.append(td);
            });
            table.append(tr);
        }
        return [ table ];
    }
    else if(shape.length === 3) {
        let result = [];
        let [ tableCount, colCount, rowCount ] = shape;
        console.log(tableCount, rowCount, colCount);
        for(let i = 0; i < tableCount * rowCount * colCount; i += rowCount * colCount) {
            let table = document.createElement("table");
            for(let j = 0; j < rowCount * colCount; j += rowCount) {
                let tr = document.createElement("tr");
                let start = i + j;
                console.log(i, j, start);
                data.slice(start, start + rowCount).forEach(cell => {
                    let el = htmlEncode(cell);
                    let td = document.createElement("td");
                    td.append(...el);
                    tr.append(td);
                });
                table.append(tr);
            }
            result.push(table);
        }
        console.log("FINAL", result);
        return result;
    }
    return ["idk yet :("];
};

window.addEventListener("load", function () {
    const inputElement = document.getElementById("input");
    const outputElement = document.getElementById("output");
    const submitButton = document.getElementById("submit");
    
    const wsUri = "ws://localhost:8081";
    const websocket = new WebSocket(wsUri);
    
    const showComputation = (input, outputs) => {
        let inRow = document.createElement("div");
        inRow.textContent = inputElement.value; 
        inRow.classList.add("input-row");
        
        let outRow = document.createElement("div");
        outRow.classList.add("output-row");
        outRow.append(...outputs);
        
        let container = document.createElement("div");
        container.classList.add("computation");
        container.append(inRow, outRow);
        outputElement.prepend(container);
    };
    
    const parseLine = line => {
        if(!line) return;
        console.log("LINE:", line);
        let data = JSON.parse(line);
        let decoded = decode(data);
        console.log("Decoded:", decoded);
        let result = htmlEncode(decoded);
        
        showComputation(
            inputElement.value, // TODO: use the correct source (somehow associate inputs with outputs, by ID perhaps)
            result
        );
        
        /*
        // TODO: make this actually work
        // figure out what scroll-margin-top: 48px; attaches to
        // figure out the actual amount
        container.scrollIntoView({
            // behavior: "smooth",
        });
        */
    };
    
    const submit = () => {
        // TODO: await open?
        websocket.send(JSON.stringify({
            command: inputElement.value,
        }));
    };
    
    inputElement.addEventListener("keydown", function (ev) {
        if(ev.key === "Enter") {
            submit();
        }
    });
    submitButton.addEventListener("click", function () {
        submit();
    });
    
    websocket.addEventListener("open", () => {
        // TODO: signal interface is open
    });
    websocket.addEventListener("message", (e) => {
        console.log("MESSAGE RECEIVED:", e);
        // TODO: collect results until newline, to handle long chunks(?)
        let { output, error } = JSON.parse(e.data);
        if(error) {
            showComputation(
                inputElement.value, // TODO: use the correct source (somehow associate inputs with outputs, by ID perhaps)
                `The bridge encountered an error with code ${error}. You should not be able to see this.`
            );
        }
        else {
            let lines = output.split(/\r?\n/g);
            console.log(lines);
            lines.forEach(parseLine);
        }
    });
    
    websocket.addEventListener("error", (e) => {
        console.error("Error:", e);
    });
});
