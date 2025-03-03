// Initial game state
let gameState = {
	money: 500,
	political: 100,
	manpower: 100,
	turns: 0,
	inefficiency: 1000 // Example total inefficiency to reduce
};

// Update display
function updateDisplay() {
	document.getElementById('money').innerText = gameState.money;
	document.getElementById('political').innerText = gameState.political;
	document.getElementById('manpower').innerText = gameState.manpower;
}

// Save score to leaderboard
function saveScore(playerName, turns) {
	let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
	leaderboard.push({ name: playerName, turns });
	leaderboard.sort((a, b) => a.turns - b.turns); // Sort by fewest turns
	localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10))); // Top 10
}

// Display leaderboard
function displayLeaderboard() {
	let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
	let output = 'Leaderboard:\n';
	leaderboard.forEach((entry, index) => {
		output += `${index + 1}. ${entry.name}: ${entry.turns} turns\n`;
	});
	document.getElementById('leaderboard').innerText = output;
}

// Handle commands
function processCommand(command) {
	const output = document.getElementById('output');
	command = command.toLowerCase().trim();

	if (command.startsWith('view')) {
		output.innerText = `Viewing agency ${command.split(' ')[1]}...`; // Placeholder
	} else if (command === 'end') {
		gameState.turns++;
		output.innerText = `Turn ${gameState.turns} ended.`;
		// Example win condition
		if (gameState.inefficiency <= 100) {
			output.innerText += '\nYou won! Inefficiency reduced!';
			saveScore(prompt('Enter your name:'), gameState.turns);
			displayLeaderboard();
		}
	} else if (command === 'leaderboard') {
		displayLeaderboard();
	} else {
		output.innerText = 'Unknown command. Try again.';
	}
}

// Event listener for input
document.getElementById('commandInput').addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		processCommand(e.target.value);
		e.target.value = '';
	}
});

// Initial setup
updateDisplay();