const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const textInput = document.getElementById("textInput");
const undoStack = [];
const redoStack = [];
let textObjects = []; // Store all text objects
let selectedText = null;
let isDragging = false;

// Initial state
saveState();

// Add Text Button
document.getElementById("addTextButton").addEventListener("click", () => {
  // Show the input box inside the canvas
  textInput.style.display = "block";
  textInput.style.left = `${canvas.width / 2 - 50}px`;
  textInput.style.top = `${canvas.height / 2 - 10}px`;
  textInput.focus();
});

// Handle Enter Key to Add Text
textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const text = textInput.value;
    if (text.trim() !== "") {
      const fontSize = document.getElementById("fontSize").value;
      const font = document.getElementById("fontSelect").value;

      // Add the text object to the array
      const textObj = {
        text,
        x: canvas.width / 2 - 50, // Centered horizontally
        y: canvas.height / 2, // Centered vertically
        fontSize: parseInt(fontSize),
        font,
        bold: false,
        italic: false,
        underline: false,
      };

      textObjects.push(textObj);
      drawCanvas();
      saveState();
    }

    // Hide the input box after adding text
    textInput.style.display = "none";
    textInput.value = "";
  }
});

// Draw canvas content
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  textObjects.forEach((obj) => {
    ctx.font = `${obj.bold ? "bold " : ""}${obj.italic ? "italic " : ""}${obj.fontSize}px ${obj.font}`;
    ctx.fillText(obj.text, obj.x, obj.y);

    // Draw underline if enabled
    if (obj.underline) {
      const textWidth = ctx.measureText(obj.text).width;
      ctx.beginPath();
      ctx.moveTo(obj.x, obj.y + 5); // Slightly below the text
      ctx.lineTo(obj.x + textWidth, obj.y + 5);
      ctx.strokeStyle = "black";
      ctx.stroke();
    }
  });
}

// Save canvas state
function saveState() {
  undoStack.push(canvas.toDataURL());
  redoStack.length = 0;
}

// Undo/Redo functionality
document.getElementById("undoButton").addEventListener("click", () => {
  if (undoStack.length > 1) {
    redoStack.push(undoStack.pop());
    restoreState(undoStack[undoStack.length - 1]);
  }
});

document.getElementById("redoButton").addEventListener("click", () => {
  if (redoStack.length > 0) {
    const state = redoStack.pop();
    undoStack.push(state);
    restoreState(state);
  }
});

// Restore canvas state
function restoreState(state) {
  const img = new Image();
  img.src = state;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}

// Text Styling (Bold, Italic, Underline)
document.getElementById("boldButton").addEventListener("click", () => {
    if (selectedText) {
      selectedText.bold = !selectedText.bold;
      drawCanvas();
      saveState();
    }
  });

  document.getElementById("italicButton").addEventListener("click", () => {
    if (selectedText) {
      selectedText.italic = !selectedText.italic;
      drawCanvas();
      saveState();
    }
  });

  document.getElementById("underlineButton").addEventListener("click", () => {
    if (selectedText) {
      selectedText.underline = !selectedText.underline;
      drawCanvas();
      saveState();
    }
  });

  // Dragging Text
  canvas.addEventListener("mousedown", (e) => {
    const { offsetX, offsetY } = e;

    selectedText = textObjects.find((obj) => {
      const textWidth = ctx.measureText(obj.text).width;
      return (
        offsetX >= obj.x &&
        offsetX <= obj.x + textWidth &&
        offsetY >= obj.y - obj.fontSize &&
        offsetY <= obj.y
      );
    });

    if (selectedText) isDragging = true;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging && selectedText) {
      const { offsetX, offsetY } = e;
      selectedText.x = offsetX;
      selectedText.y = offsetY;
      drawCanvas();
    }
  });

  canvas.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      saveState();
    }
  });