# VisualJ

## Installation

```
git clone https://github.com/ConorOBrien-Foxx/VisualJ.git
cd VisualJ
npm install
```

## Running

```
cd VisualJ
npm start
```

Then, navigate to localhost:8080.

## Known issues/deficiencies

- Unicode support is poor. I still need to figure out how to interop unicode input with J's character system. I suspect there is no perfect solution.
- Currently, displaying [k-cells](https://www.jsoftware.com/help/primer/k_cell.htm) is hardcoded, and only supports 0-, 1-, 2-, and 3-cells. 4-cells and beyond are not currently supported.
- I plan to make it perform more like a REPL, with input being cleared on submission, and allowing the user to arrow key through the execution history.
- I also plan on allowing you to toggle individual cells between the visual display, as well as the conventional J display