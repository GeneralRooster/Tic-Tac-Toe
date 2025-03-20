let playerTurn = true;
let computerMoveTimeout = 0;

const gameStatus = {
    MORE_MOVES_LEFT: 1,
    HUMAN_WINS: 2,
    COMPUTER_WINS: 3,
    DRAW_GAME: 4,
};

window.addEventListener("DOMContentLoaded", domLoaded);

function domLoaded() {
    // Setup the click event for the "New game" button
    const newBtn = document.getElementById("newGameButton");
    newBtn.addEventListener("click", newGame);

    // Create click-event handlers for each game board button
    const buttons = getGameBoardButtons();
    for (let button of buttons) {
        button.addEventListener("click", function () {
            boardButtonClicked(button);
        });
    }

    // Clear the board
    newGame();
}

// Returns an array of 9 <button> elements that make up the game board. The first 3
// elements are the top row, the next 3 the middle row, and the last 3 the
// bottom row.
function getGameBoardButtons() {
    return document.querySelectorAll("#gameBoard > button");
}

function checkForWinner() {
    const buttons = getGameBoardButtons();

    // Ways to win
    const possibilities = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // rows
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // columns
        [0, 4, 8],
        [2, 4, 6], // diagonals
    ];

    // Check for a winner first
    for (let indices of possibilities) {
        if (
            buttons[indices[0]].innerHTML !== "" &&
            buttons[indices[0]].innerHTML === buttons[indices[1]].innerHTML &&
            buttons[indices[1]].innerHTML === buttons[indices[2]].innerHTML
        ) {
            // Found a winner
            if (buttons[indices[0]].innerHTML === "X") {
                return gameStatus.HUMAN_WINS;
            } else {
                return gameStatus.COMPUTER_WINS;
            }
        }
    }

    // See if any more moves are left
    for (let button of buttons) {
        if (button.innerHTML !== "X" && button.innerHTML !== "O") {
            return gameStatus.MORE_MOVES_LEFT;
        }
    }

    // If no winner and no moves left, then it's a draw
    return gameStatus.DRAW_GAME;
}

function newGame() {
    // Use clearTimeout() to clear the computer's move timeout and then set computerMoveTimeout back to 0
    clearTimeout(computerMoveTimeout);
    computerMoveTimeout = 0;
    // Loop through all game board buttons and set the text content of each to an empty string. Also remove the class name and disabled attribute.
    let buttons = getGameBoardButtons();
    for (let button of buttons) {
        button.innerHTML = "";
        button.classList.remove("x", "o");
        button.disabled = false;
    }
    // The disabled attribute prevents the user from clicking the button, but all the buttons should be clickable when starting a new game. Allow the player to take a turn by setting playerTurn to true.
    playerTurn = true;
    // Set the text of the turn information paragraph to "Your turn".
    document.getElementById("turnInfo").innerHTML = "Your turn";
}

function boardButtonClicked(button) {
    // If playerTurn is true:
    if (playerTurn) {
        button.innerHTML = "X"; // Set the button's text content to "X".
        button.classList.add("x"); // Add the "x" class to the button.
        button.disabled = true; // Set the button's disabled attribute to true so the button cannot be clicked again.
        switchTurn(); // Call switchTurn() so the computer can take a turn.
    }
}

function switchTurn() {
    let status = checkForWinner(); // Call checkForWinner() to determine the game's status.
    // If more moves are left:
    if (status === gameStatus.MORE_MOVES_LEFT) {
        playerTurn = !playerTurn; // Toggle playerTurn's value from false to true or from true to false.
        if (playerTurn) {
            document.getElementById("turnInfo").innerHTML = "Your turn"; // Set the turn information paragraph's text content to "Your turn" if playerTurn is true
        } else {
            document.getElementById("turnInfo").innerHTML = "Computer's turn"; // Set the turn information paragraph's text content to "Computer's turn" if playerTurn is false.
            computerMoveTimeout = setTimeout(makeComputerMove, 1000); // If switching from the player's turn to the computer's turn, use setTimeout() to call makeComputerMove() after 1 second (1000 milliseconds). Assign the return value of setTimeout() to computerMoveTimeout.
        }
    }
    // In the case of a winner or a draw game, do the following:
    else {
        playerTurn = false; // Set playerTurn to false to prevent the user from being able to place an X after the game is over.
        if (status === gameStatus.HUMAN_WINS) {
            document.getElementById("turnInfo").innerHTML = "You win!"; // If the human has won, display the text "You win!" in the turn info paragraph.
        } else if (status === gameStatus.COMPUTER_WINS) {
            document.getElementById("turnInfo").innerHTML = "Computer wins!"; // If the computer has won, display the text "Computer wins!" in the turn info paragraph.
        } else {
            document.getElementById("turnInfo").innerHTML = "Draw game"; // If the game is a draw, display the text "Draw game" in the turn info paragraph.
        }
    }
}

function makeComputerMove() {
    let buttons = getGameBoardButtons();
    let availableButtons = [];

    // Find available spaces
    for (let button of buttons) {
        if (button.innerHTML !== "X" && button.innerHTML !== "O") {
            availableButtons.push(button);
        }
    }

    // No available moves
    if (availableButtons.length === 0) return;

    // AI decision hierarchy
    let bestMove = findWinningMove("O");             // Try to win
    if (bestMove === null) {
        bestMove = findWinningMove("X");            // Block player win
    }
    if (bestMove === null) {
        bestMove = findForkMove("O");              // Create a fork
    }
    if (bestMove === null) {
        bestMove = findForkBlockingMove("X");      // Block player fork
    }
    if (bestMove === null) {
        bestMove = findStrategicMove(buttons);     // Strategic move
    }

    // If all else fails, choose random (shouldn't happen with proper strategy)
    if (bestMove === null && availableButtons.length > 0) {
        bestMove = availableButtons[Math.floor(Math.random() * availableButtons.length)];
    }

    // Make the move
    if (bestMove !== null) {
        bestMove.innerHTML = "O";
        bestMove.classList.add("o");
        bestMove.disabled = true;
    }

    switchTurn();
}

function findWinningMove(symbol) {
    let buttons = getGameBoardButtons();
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let pattern of winPatterns) {
        let [a, b, c] = pattern;
        let buttonValues = [buttons[a].innerHTML, buttons[b].innerHTML, buttons[c].innerHTML];
        
        // Check if we can win in this pattern
        if (buttonValues.filter(val => val === symbol).length === 2 && buttonValues.includes("")) {
            let emptyIndex = buttonValues.indexOf("");
            return buttons[pattern[emptyIndex]];
        }
    }
    return null;
}

function findForkMove(symbol) {
    // A fork is when you create two winning opportunities in a single move
    let buttons = getGameBoardButtons();
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    // For each empty spot, check if placing 'symbol' there creates two winning opportunities
    for (let i = 0; i < 9; i++) {
        if (buttons[i].innerHTML === "") {
            // Simulate placing symbol here
            buttons[i].innerHTML = symbol;
            
            // Count potential winning paths after this move
            let winningPaths = 0;
            for (let pattern of winPatterns) {
                let [a, b, c] = pattern;
                let values = [buttons[a].innerHTML, buttons[b].innerHTML, buttons[c].innerHTML];
                
                // If we have one empty space and two of our symbols, it's a potential win
                if (values.filter(val => val === symbol).length === 2 && values.includes("")) {
                    winningPaths++;
                }
            }
            
            // Undo the simulation
            buttons[i].innerHTML = "";
            
            // If this creates 2+ winning paths, it's a fork
            if (winningPaths >= 2) {
                return buttons[i];
            }
        }
    }
    return null;
}

function findForkBlockingMove(playerSymbol) {
    let buttons = getGameBoardButtons();
    const center = 4;
    const corners = [0, 2, 6, 8];
    
    // First check if opponent can create a fork
    let opponentFork = findForkMove(playerSymbol);
    if (opponentFork !== null) {
        // Special case: if opponent can make a corner fork after we've taken center
        if (buttons[center].innerHTML === "O" && 
            corners.some(c => buttons[c].innerHTML === playerSymbol) &&
            corners.some(c => buttons[c].innerHTML === "")) {
            
            // Block by playing a side
            const sides = [1, 3, 5, 7];
            for (let side of sides) {
                if (buttons[side].innerHTML === "") {
                    return buttons[side];
                }
            }
        }
        
        // Otherwise block the fork directly
        return opponentFork;
    }
    return null;
}

function findStrategicMove(buttons) {
    const center = 4;
    const corners = [0, 2, 6, 8];
    const sides = [1, 3, 5, 7];
    
    // 1. Take center if it's free
    if (buttons[center].innerHTML === "") {
        return buttons[center];
    }
    
    // 2. If player took center, take a corner
    if (buttons[center].innerHTML === "X") {
        for (let corner of corners) {
            if (buttons[corner].innerHTML === "") {
                return buttons[corner];
            }
        }
    }
    
    // 3. Check for "opposite corner" strategy
    for (let i = 0; i < corners.length; i++) {
        let oppositeIndex = 8 - corners[i]; // Maps 0→8, 2→6, 6→2, 8→0
        if (buttons[corners[i]].innerHTML === "X" && buttons[oppositeIndex].innerHTML === "") {
            return buttons[oppositeIndex];
        }
    }
    
    // 4. Take any corner
    for (let corner of corners) {
        if (buttons[corner].innerHTML === "") {
            return buttons[corner];
        }
    }
    
    // 5. Take any side
    for (let side of sides) {
        if (buttons[side].innerHTML === "") {
            return buttons[side];
        }
    }
    
    return null;
}