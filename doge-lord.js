document.addEventListener('DOMContentLoaded', () => {
	const output = document.getElementById('output');
	const buttons = document.getElementById('buttons');
	const beep = document.getElementById('beep');
	const click = document.getElementById('click');

	const agencies = [
		{ name: "Transportation", inefficiency: 60, reforms: [] },
		{ name: "Education", inefficiency: 75, reforms: [] },
		{ name: "Defense", inefficiency: 50, reforms: [] }
	];
	const strategies = [
		{ name: "Process Reengineering", cost: { money: 100, political: 20, manpower: 50 }, reduction: [10, 20] },
		{ name: "Technology Upgrade", cost: { money: 150, political: 10, manpower: 30 }, reduction: [15, 25] },
		{ name: "Staff Training", cost: { money: 50, political: 5, manpower: 20 }, reduction: [5, 10] }
	];
	let player = { money: 500, political: 100, manpower: 100, turn: 1 };
	let currentState = "start_turn";
	const maxTurns = 30;

	function updateOutput(text) {
		const entry = document.createElement('div');
		entry.className = 'log-entry';
		const timestamp = document.createElement('span');
		timestamp.className = 'timestamp';
		timestamp.textContent = `Turn ${player.turn}: `;
		const content = document.createElement('span');
		content.textContent = text;
		entry.appendChild(timestamp);
		entry.appendChild(content);
		output.appendChild(entry);
		output.scrollTop = output.scrollHeight;
	}

	function updateStatus() {
		document.getElementById('turn').textContent = player.turn;
		document.getElementById('money').textContent = player.money;
		document.getElementById('political').textContent = player.political;
		document.getElementById('manpower').textContent = player.manpower;
		document.getElementById('inefficiency').textContent = totalInefficiency();
	}

	function totalInefficiency() {
		return agencies.reduce((sum, agency) => sum + agency.inefficiency, 0);
	}

	function playBeep() {
		beep.currentTime = 0;
		beep.play().catch(e => console.log("Sound play failed:", e));
	}

	function playClick() {
		click.currentTime = 0;
		click.play().catch(e => console.log("Sound play failed:", e));
	}

	function createButton(label, callback, className = '') {
		const button = document.createElement('button');
		button.textContent = label;
		button.className = `retro-button ${className}`;
		button.addEventListener('click', () => {
			playClick();
			playBeep();
			callback();
		});
		return button;
	}

	function updateButtons(actions) {
		buttons.innerHTML = '';
		actions.forEach(([label, callback, className]) => buttons.appendChild(createButton(label, callback, className)));
	}

	function viewStatus() {
		let statusText = "Agency Status:\n";
		agencies.forEach((agency, index) => {
			statusText += `Agency ${index + 1}: ${agency.name}\nInefficiency: ${agency.inefficiency}\nReforms Applied: ${agency.reforms.join(', ') || 'None'}\n\n`;
		});
		updateOutput(statusText);
	}

	function reformAgency(agencyIndex) {
		currentState = "choose_strategy";
		const agency = agencies[agencyIndex];
		const strategyButtons = strategies.map((strategy, i) => {
			const costStr = `(${strategy.cost.money}M, ${strategy.cost.political}P, ${strategy.cost.manpower}MP)`;
			return [ `${strategy.name} ${costStr}`, () => applyStrategy(strategy, agencyIndex) ];
		}).concat([["Back", () => setState("start_turn")]]);
		updateButtons(strategyButtons);
		updateOutput(`Choose a strategy for ${agency.name}.`);
	}

	function applyStrategy(strategy, agencyIndex) {
		const agency = agencies[agencyIndex];
		const costStr = `Cost: ${strategy.cost.money}M, ${strategy.cost.political}P, ${strategy.cost.manpower}MP`;
		if (player.money >= strategy.cost.money && player.political >= strategy.cost.political && player.manpower >= strategy.cost.manpower) {
			player.money -= strategy.cost.money;
			player.political -= strategy.cost.political;
			player.manpower -= strategy.cost.manpower;
			const reduction = Math.floor(Math.random() * (strategy.reduction[1] - strategy.reduction[0] + 1)) + strategy.reduction[0];
			agency.inefficiency = Math.max(0, agency.inefficiency - reduction);
			agency.reforms.push(strategy.name);
			updateOutput(`Applied ${strategy.name} to ${agency.name}! ${costStr}. Inefficiency reduced by ${reduction}.`);
		} else {
			updateOutput(`Insufficient resources for ${strategy.name}. ${costStr} needed.`);
		}
		updateStatus();
		setState("start_turn");
	}

	function manageResources() {
		currentState = "manage_resources";
		const options = [
			["Hire Consultants (50M -> 20MP)", () => tradeResources("money", 50, "manpower", 20)],
			["Lobby Politicians (20P -> 100M)", () => tradeResources("political", 20, "money", 100)],
			["Train Staff (30MP -> 10P)", () => tradeResources("manpower", 30, "political", 10)]
		];
		updateButtons(options.concat([["Back", () => setState("start_turn")]]));
		updateOutput("Choose a resource management option.");
	}

	function tradeResources(fromRes, fromAmt, toRes, toAmt) {
		const costStr = `${fromAmt} ${fromRes} -> ${toAmt} ${toRes}`;
		if (player[fromRes] >= fromAmt) {
			player[fromRes] -= fromAmt;
			player[toRes] += toAmt;
			updateOutput(`Managed resources! ${costStr}.`);
		} else {
			updateOutput(`Not enough ${fromRes}. Need ${fromAmt}.`);
		}
		updateStatus();
		setState("start_turn");
	}

	function endTurn() {
		player.turn += 1;
		updateStatus();
		if (totalInefficiency() < 100) {
			updateOutput("Victory! Inefficiency below 100. You’re the DOGE Lord! 🇺🇸");
			setState("game_over");
		} else if (player.turn > maxTurns) {
			updateOutput("Game Over! Too many turns. Try again!");
			setState("game_over");
		} else {
			updateOutput(`Turn ${player.turn} begins. Keep pushing!`);
		}
	}

	function setState(state) {
		currentState = state;
		if (state === "start_turn") {
			const reformButtons = agencies.map((a, i) => [`Reform ${a.name}`, () => reformAgency(i)]);
			updateButtons([
				["View Status", viewStatus, 'view-status-button'],
				["Manage Resources", manageResources],
				...reformButtons,
				["End Turn", endTurn, 'end-turn-button']
			]);
		} else if (state === "game_over") {
			updateButtons([
				["Play Again", restartGame]
			]);
		}
	}

	function restartGame() {
		agencies.forEach((a, i) => { a.inefficiency = [60, 75, 50][i]; a.reforms = []; });
		player = { money: 500, political: 100, manpower: 100, turn: 1 };
		output.innerHTML = '';
		updateOutput("Welcome to DOGE Lord! Reduce inefficiency below 100 in 30 turns.");
		updateStatus();
		setState("start_turn");
	}

	// Initialize game
	updateStatus();
	setState("start_turn");
});