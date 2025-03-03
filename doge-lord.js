document.addEventListener('DOMContentLoaded', () => {
	const output = document.getElementById('output');
	const buttons = document.getElementById('buttons');
	const beep = document.getElementById('beep');

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
		output.innerHTML += `<br>${text}`;
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

	function createButton(label, callback) {
		const button = document.createElement('button');
		button.textContent = label;
		button.className = 'retro-button';
		button.addEventListener('click', () => {
			playBeep();
			callback();
		});
		return button;
	}

	function updateButtons(actions) {
		buttons.innerHTML = '';
		actions.forEach(([label, callback]) => buttons.appendChild(createButton(label, callback)));
	}

	function reformAgency(agencyIndex) {
		currentState = "choose_strategy";
		const agency = agencies[agencyIndex];
		const buttons = strategies.map((strategy, i) => {
			const costStr = `(${strategy.cost.money}M, ${strategy.cost.political}P, ${strategy.cost.manpower}MP)`;
			return [ `${strategy.name} ${costStr}`, () => applyStrategy(strategy, agencyIndex) ];
		}).concat([["Back", () => setState("start_turn")]]);
		updateButtons(buttons);
		updateOutput(`Choose a strategy for ${agency.name}.`);
	}

	function applyStrategy(strategy, agencyIndex) {
		const agency = agencies[agencyIndex];
		if (player.money >= strategy.cost.money && player.political >= strategy.cost.political && player.manpower >= strategy.cost.manpower) {
			player.money -= strategy.cost.money;
			player.political -= strategy.cost.political;
			player.manpower -= strategy.cost.manpower;
			const reduction = Math.floor(Math.random() * (strategy.reduction[1] - strategy.reduction[0] + 1)) + strategy.reduction[0];
			agency.inefficiency = Math.max(0, agency.inefficiency - reduction);
			agency.reforms.push(strategy.name);
			updateOutput(`Much wow! Applied ${strategy.name} to ${agency.name}. Reduced inefficiency by ${reduction}.`);
		} else {
			updateOutput("Such sad! Not enough resources.");
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
		if (player[fromRes] >= fromAmt) {
			player[fromRes] -= fromAmt;
			player[toRes] += toAmt;
			updateOutput(`Very trade! Gained ${toAmt} ${toRes}, spent ${fromAmt} ${fromRes}.`);
		} else {
			updateOutput(`No can do! Need more ${fromRes}.`);
		}
		updateStatus();
		setState("start_turn");
	}

	function endTurn() {
		player.turn += 1;
		if (Math.random() < 0.2) {
			const events = [
				() => { player.money = Math.max(0, player.money - 50); updateOutput("Budget Cut! Lost 50 money."); },
				() => { player.political = Math.max(0, player.political - 20); updateOutput("Political Scandal! -20 political."); },
				() => { player.manpower = Math.max(0, player.manpower - 30); updateOutput("Worker Strike! -30 manpower."); },
				() => { player.money += 100; updateOutput("Economic Boom! +100 money."); },
				() => { player.political += 20; updateOutput("Elon Tweets! +20 political capital. 🐶🚀"); }
			];
			random.choice(events)();
		}
		updateStatus();
		if (totalInefficiency() < 100) {
			updateOutput("Victory! You’re the DOGE Lord! Reduced inefficiency below 100. 🐶🚀🇺🇸");
			setState("game_over");
		} else if (player.turn > maxTurns) {
			updateOutput("Game Over! Time’s up, inefficiency remains. Try again, fren! 🐶");
			setState("game_over");
		} else {
			updateOutput(`Turn ${player.turn} begins. Much challenge!`);
			setState("start_turn");
		}
	}

	function shareScore() {
		const inefficiency = totalInefficiency();
		const turns = player.turn;
		const tweetText = `I’m the DOGE Lord! Reduced inefficiency to ${inefficiency} in ${turns} turns! 🐶🚀🇺🇸 Beat me? #DOGELord #ToTheMoon`;
		const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=https://medinajulioc.github.io/doge-lord-game/`;
		window.open(tweetUrl, '_blank');
	}

	function restartGame() {
		agencies.forEach(a => { a.inefficiency = [60, 75, 50][agencies.indexOf(a)]; a.reforms = []; });
		player = { money: 500, political: 100, manpower: 100, turn: 1 };
		output.innerHTML = "Welcome back to DOGE Lord! Reduce inefficiency below 100 in 30 turns.";
		updateStatus();
		setState("start_turn");
	}

	function setState(state) {
		currentState = state;
		if (state === "start_turn") {
			const reformButtons = agencies.map((a, i) => [`Reform ${a.name}`, () => reformAgency(i)]);
			updateButtons(reformButtons.concat([
				["Manage Resources", manageResources],
				["End Turn", endTurn]
			]));
		} else if (state === "game_over") {
			updateButtons([
				["Share Score on X", shareScore],
				["Play Again", restartGame]
			]);
		}
	}

	// Initialize game
	updateStatus();
	setState("start_turn");
});