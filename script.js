// Me playing with Xs and AI playing with Os
const playerMe = "X";
const playerAI = "O";

// possible combinations for winning the game
const winCombination = [
	[0,1,2],
	[3,4,5],
	[6,7,8],
	[0,3,6],
	[1,4,7],
	[2,5,8],
	[0,4,8],
	[2,4,6]
];

// map all the table cells
const cells = document.querySelectorAll(".cell");

// inititalize the empty board
var board = Array(9);

// start the Game!
window.onLoad = initGame();

// initialize or reset the game
function initGame() {

	document.querySelector(".result").style.display = "none";

	// start with a numbered board 0-8
	board = Array.from(Array(9).keys());

	// add click events for all spots
	cells.forEach(cell => cell.addEventListener('click', setClick, false));
	cells.forEach(cell => cell.style.backgroundColor = "");
	cells.forEach(cell => cell.innerText = "");

}

// click event on a triggered spot
function setClick(spot) {

	// set the clicked spot as a move by Me - the AI doesn't click
	setMove(spot.target.id, playerMe);

	// if the game is not over yet, let the AI make its move
	if (!validateBoard(board, playerMe)) setMove(bestSpot(), playerAI);

}

// set a player move and validate its outcome
function setMove(spot, player) {

	// mark the spot for the player
	board[spot] = player;

	// add text to the spot and remove the EventListener, so it can no longer trigger a setClick event
	cells[spot].innerText = player;
	cells[spot].removeEventListener('click', setClick, false);

	// if game is won or tied then it's over
	if (validateBoard(board, player)) gameOver(validateBoard(board, player));

}

// validate if the board has a winner or if it's tied
function validateBoard(board, player) {

	// check all possible winning combinations
	for (let [combination, win] of winCombination.entries()) {

		// if every spot in the combination is taken by the same player, the game is won - return combination and player
		if(win.every(spot => board[spot] === player)) return { combination: combination, player: player };

	}

	// if there are no numbers left on the board, it's a tie
	if (board.filter(spot => typeof spot === 'number').length == 0) return true;

	return null;

}

// game is over, we have a winner! (or a tie)
function gameOver(result) {

	// display message
	document.querySelector(".result").style.display = "block";

	// add background colors
	if (typeof result.combination === 'number') {
		// if there's a winner (because we have a combination number)
		winCombination[result.combination].forEach(cell => cells[cell].style.backgroundColor = (result.player == playerMe ? "#f2ffcc" : "#ffe6cc"));
		document.querySelector(".winner").innerText = (result.player == playerMe ? "You win!" : "You lose.");
	} else {
		// if there's a tie (because the result does not have a combination, but is only set to true)
		cells.forEach(cell => cell.style.backgroundColor = "#e6f9ff");
		document.querySelector(".winner").innerText = "It's a tie!";
	}

	// remove EventListeners for all cells
	cells.forEach(cell => cell.removeEventListener('click', setClick, false));

}

// identify the best spot for the AI
function bestSpot() { return minmax(board, playerAI, 1).index; }

// identify empty spots on the board
function emptySpots(board) { return board.filter(spot => typeof spot === 'number'); }

// minmax algorithm
function minmax(newBoard, player, depth) {

	// include the depth in the score / health function to really go for the killer move - otherwise the first out of n options will be taken, which might take more moves in total
	if (result = validateBoard(newBoard, playerMe)) {
		// if AI has lost return -10 or 0 for a tie
		return (typeof result.combination === 'number' ? { score: -10 + depth } : { score: 0 });
	} else if (result = validateBoard(newBoard, playerAI)) {
		// if AI has won return +10 or 0 for a tie (but ties are handled by the playerMe above anyway)
		return (typeof result.combination === 'number' ? { score: +10 - depth } : { score: 0 });
	}

	// get all empty spots for the current board
	var spots = emptySpots(newBoard);

	// track all possible moves in Array
	var moves = [];

	// simulate a full game for each empty spot
	for (var i=0; i<spots.length; i++) {

		// make a move
		var move = {};

		// field for the move is the empty spot in the loop
		move.index = newBoard[spots[i]];

		// mark the spot for the player
		newBoard[spots[i]] = player;

		// recursive call - finish the game and remember the score
		if (player == playerAI) {
			var result = minmax(newBoard, playerMe, depth + 1);
			move.score = result.score;
		} else {
			var result = minmax(newBoard, playerAI, depth + 1);
			move.score = result.score;
		}

		// open the spot by reverting to its original number
		newBoard[spots[i]] = move.index;

		// remember the move (which spot, which score)
		moves.push(move);

	}

	// sort the move by score - AI to win: highest score on top, Me to win: lowest score at the end
	moves.sort(function(a,b) { return b.score - a.score; });

	// return the best move (index (for bestSpot) and score (for recursive))
	return (player == playerAI ? moves[0] : moves[moves.length-1]);

}
