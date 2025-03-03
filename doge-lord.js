const output = document.getElementById('output');
const buttonsContainer = document.getElementById('buttons');
const commandInput = document.getElementById('command');

const agencies = [
	{ name: "Transportation", inefficiency: 60, reforms: [] },
	{ name: "Education", inefficiency: 75, reforms: [] },
	{ name: "Defense", inefficiency: 50, reforms: [] }
];
const strategies = ["Process Reengineering", "Technology Upgrade", "Staff Training"];
let player = { turn: 1, money: 500, political: 100, manpower: 100 };

// Append text to output
function appendOutput(text) {
	output.innerHTML += `<p>${text}</p>`;
	output.scrollTop = output.scrollHeight;
}

// Update player stats
function updateStats() {
	document.getElementById('turn').textContent = player.turn;
	document.getElementById('money').textContent = player.money;
	document.getElementById('political').textContent = player.political;
	document.getElementById('manpower').textContent = player.manpower;
}

// Create a button with accessibility
function createButton(text, onClick) {
	const button = document.createElement('button');
	button.className = 'retro-button';
	button.textContent = text;
	button.onclick = onClick;
	button.setAttribute('aria-label', text);
	return button;
}

// Clear buttons
function clearButtons() {
	buttonsContainer.innerHTML = '';
}

// Show main buttons
function showMainButtons() {
	clearButtons();
	buttonsContainer.appendChild(createButton('View Agencies', showViewAgencies));
	buttonsContainer.appendChild(createButton('Reform Agency', showReformAgency));
	buttonsContainer.appendChild(createButton('Manage Resources', showManageResources));
	buttonsContainer.appendChild(createButton('End Turn', endTurn));
	buttonsContainer.appendChild(createButton('Help', showHelp));
}

// Sub-menu: View Agencies
function showViewAgencies() {
	clearButtons();
	agencies.forEach((agency, index) => {
		buttonsContainer.appendChild(createButton(agency.name, () => viewAgency(index)));
	});
	buttonsContainer.appendChild(createButton('Back', showMainButtons));
}

// Sub-menu: Reform Agency
function showReformAgency() {
	clearButtons();
	agencies.forEach((agency, index) => {
		buttonsContainer.appendChild(createButton(agency.name, () => reformAgency(index)));
	});
	buttonsContainer.appendChild(createButton('Back', showMainButtons));
}

// Sub-menu: Manage Resources
function showManageResources() {
	clearButtons();
	buttonsContainer.appendChild(createButton('Hire Consultants', () => {
		player.money -= 50;
		player.manpower += 20;
		appendOutput('Hired consultants: -50 Money, +20 Manpower');
		updateStats();
		showMainButtons();
	}));
	buttonsContainer.appendChild(createButton('Back', showMainButtons));
}

// Action: View agency details
function viewAgency(index) {
	const agency = agencies[index];
	appendOutput(`Agency: ${agency.name}\nInefficiency: ${agency.inefficiency}\nReforms: ${agency.reforms.join(', ') || 'None'}`);
	showMainButtons();
}

// Action: Reform agency
function reformAgency(index) {
	clearButtons();
	strategies.forEach((strategy) => {
		buttonsContainer.appendChild(createButton(strategy, () => {
			agencies[index].reforms.push(strategy);
			agencies[index].inefficiency -= 10; // Simplified effect
			appendOutput(`Applied ${strategy} to ${agencies[index].name}. Inefficiency reduced.`);
			updateStats();
			showMainButtons();
		}));
	});
	buttonsContainer.appendChild(createButton('Back', showReformAgency));
}

// Action: End turn
function endTurn() {
	player.turn++;
	appendOutput(`Turn ${player.turn} begins.`);
	updateStats();
	showMainButtons();
}

// Action: Show help
function showHelp() {
	appendOutput('Commands:\n- View Agencies: View agency details\n- Reform Agency: Apply strategies\n- Manage Resources: Adjust resources\n- End Turn: Advance to next turn');
	showMainButtons();
}

// Handle text input (optional)
commandInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		const cmd = commandInput.value.trim().toLowerCase();
		commandInput.value = '';
		if (cmd.startsWith('view')) {
			const index = parseInt(cmd.split(' ')[1]) - 1;
			if (index >= 0 && index < agencies.length) viewAgency(index);
			else appendOutput('Invalid agency number.');
		} else if (cmd === 'end') {
			endTurn();
		} else {
			appendOutput('Invalid command.');
		}
	}
});

// Initialize interface
showMainButtons();
updateStats();