document.addEventListener('DOMContentLoaded', () => {
	const output = document.getElementById('output');
	const buttons = document.getElementById('buttons');
	const beep = document.getElementById('beep');
	const siren = document.getElementById('siren');
	const click = document.getElementById('click');

	const agencies = [
		{ name: "Transportation", inefficiency: 60, reforms: [] },
		{ name: "Education", inefficiency: 75, reforms: [] },
		{ name: "Defense", inefficiency: 50, reforms: [] }
	];
	const strategies = [
		{ name: "Process Reengineering", cost: { money: 100, political: 20, manpower: 50 }, reduction: [10, 20] },
		{ name: "Technology Upgrade", cost: { money: 150, political: 10, manpower: 30 }, reduction: [15, 25] },
		{ name: "Staff Training", cost: { money: 50, political: 5, manpower: 20 }, reduction: [5, 10] },
		{ name: "Audit Systems", cost: { money: 80, political: 15, manpower: 40 }, reduction: [5, 15] },
		{ name: "Streamline Processes", cost: { money: 120, political: 10, manpower: 30 }, reduction: [10, 20] },
		{ name: "Slash Red Tape", cost: { money: 60, political: 25, manpower: 20 }, reduction: [5, 12], risk: 0.3 },
		{ name: "De-Regulate", cost: { money: 150, political: 30, manpower: 50 }, reduction: [15, 25], risk: 0.2 },
		{ name: "Elon’s Audit", cost: { money: 90, political: 10, manpower: 45 }, reduction: [10, 20] },
		{ name: "Tesla Efficiency Boost", cost: { money: 130, political: 15, manpower: 40 }, reduction: [15, 25] }
	];
	const fraudActions = [
		{ name: "Bust Fraud Rings", cost: { money: 100, political: 20, manpower: 35 }, recovery: [50, 150], reduction: [5, 10] },
		{ name: "Eliminate Waste", cost: { money: 70, political: 15, manpower: 25 }, recovery: [30, 80], reduction: [3, 8] }
	];
	let player = { money: 500, political: 100, manpower: 100, turn: 1 };
	let currentState = "start_turn";
	const maxTurns = 30;

	const quips = [
		"Bureaucracy obliterated—such justice, much savings! ⚖️🚀",
		"Government red tape shredded—Balanced efficiency, wow! ⚖️💰",
		"Politicians baffled, taxpayers cheering—This is unhinged justice! 🇺🇸",
		"Elon’s like, ‘This is lit, much savings!’",
		"SpaceX efficiency—To the moon, Efficiency Lord! 🚀",
		"Savings vibes activated—Such frugality, wow! 💰",
		"Red tape? More like red shred—Balance restored! ⚖️",
		"Fraud busted—Such justice, much savings! 🚨",
		"Waste eliminated—Efficiency unleashed, wow! 💰💥",
		"Elon’s watching, much wow—Save more or face the audit wrath! 😅"
	];

	function updateOutput(text, isConfirmation = false, isPulse = false) {
		const span = document.createElement('span');
		span.textContent = text;
		if (isConfirmation) span.className = 'confirmation';
		if (isPulse) span.className = 'pulse';
		output.appendChild(span);
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

	function playSiren() {
		siren.currentTime = 0;
		siren.play().catch(e => console.log("Sound play failed:", e));
	}

	function playClick() {
		click.currentTime = 0;
		click.play().catch(e => console.log("Sound play failed:", e));
	}

	function createButton(label, callback) {
		const button = document.createElement('button');
		button.textContent = label;
		button.className = 'retro-button';
		button.addEventListener('click', () => {
			playClick();
			playBeep();
			button.style.animation = 'flicker 0.1s';
			setTimeout(() => button.style.animation = '', 100);
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
		const costStr = `Cost: ${strategy.cost.money}M, ${strategy.cost.political}P, ${strategy.cost.manpower}MP`;
		if (player.money >= strategy.cost.money && player.political >= strategy.cost.political && player.manpower >= strategy.cost.manpower) {
			player.money -= strategy.cost.money;
			player.political -= strategy.cost.political;
			player.manpower -= strategy.cost.manpower;
			const reduction = Math.floor(Math.random() * (strategy.reduction[1] - strategy.reduction[0] + 1)) + strategy.reduction[0];
			agency.inefficiency = Math.max(0, agency.inefficiency - reduction);
			agency.reforms.push(strategy.name);
			const quip = quips[Math.floor(Math.random() * quips.length)];
			let output = `Applied ${strategy.name} to ${agency.name}! ${costStr}. Inefficiency slashed by ${reduction}—${quip}`;
			if (strategy.name === "Slash Red Tape" && Math.random() < strategy.risk) {
				player.political = Math.max(0, player.political - 15);
				output += "<br>Political backlash! -15 Political Capital.";
			} else if (strategy.name === "De-Regulate" && Math.random() < strategy.risk) {
				player.political = Math.max(0, player.political - 20);
				output += "<br>Political outrage! -20 Political Capital.";
			}
			updateOutput(output, true);
		} else {
			updateOutput(`Such sad! ${costStr} needed, but resources are low.`, true);
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
			const quip = quips[Math.floor(Math.random() * quips.length)];
			updateOutput(`Managed resources! ${costStr}. ${quip}`, true);
		} else {
			updateOutput(`No can do! Need ${fromAmt} more ${fromRes}.`, true);
		}
		updateStatus();
		setState("start_turn");
	}

	function endTurn() {
		player.turn += 1;
		let eventOutput = "";
		if (Math.random() < 0.2) {
			const events = [
				() => { player.money = Math.max(0, player.money - 50); eventOutput = "Budget Cut! Lost 50 money."; },
				() => { player.political = Math.max(0, player.political - 20); eventOutput = "Political Scandal! -20 political."; },
				() => { player.manpower = Math.max(0, player.manpower - 30); eventOutput = "Worker Strike! -30 manpower."; },
				() => { player.money += 100; eventOutput = "Economic Boom! +100 money."; },
				() => { player.political += 30; player.manpower = Math.max(0, player.manpower - 10); eventOutput = "Elon Tweets a Meme! +30 Political, -10 Manpower. 🚀"; }
			];
			random.choice(events)();
		}
		updateStatus();
		if (totalInefficiency() < 100) {
			updateOutput("Victory! You’re the Efficiency Lord! Reduced inefficiency below 100. ⚖️🚀🇺🇸", true, true);
			setState("game_over");
		} else if (player.turn > maxTurns) {
			updateOutput("Game Over! Time’s up, inefficiency remains. Try again, fren! ⚖️", true);
			setState("game_over");
		} else {
			updateOutput(`Turn ${player.turn} begins. ${eventOutput || "Much challenge!"}`, true);
		}
	}

	function hackBureaucracy() {
		currentState = "hack_bureaucracy";
		let clicks = 0;
		const maxClicks = 3;
		const timer = setTimeout(() => {
			updateOutput("Hack failed—too slow, such sad! ⚖️", true);
			setState("start_turn");
		}, 5000); // 5 seconds
		updateOutput("Hack Bureaucracy! Tap YES 3 times in 5 seconds to reduce inefficiency by 5-15. ⚖️🚀");
		updateButtons([
			["YES", () => {
				clicks++;
				if (clicks === maxClicks) {
					clearTimeout(timer);
					const reduction = Math.floor(Math.random() * 11) + 5; // 5-15
					agencies.forEach(a => a.inefficiency = Math.max(0, a.inefficiency - reduction / agencies.length));
					const quip = quips[Math.floor(Math.random() * quips.length)];
					updateOutput(`Hacked the system—Such skills! Reduced inefficiency by ${reduction}—${quip}`, true);
					updateStatus();
					setState("start_turn");
				}
			}],
			["NO", () => {
				clearTimeout(timer);
				updateOutput("Hack canceled—Too risky, wow! ⚖️", true);
				setState("start_turn");
			}]
		]);
	}

	function elonTweetChallenge() {
		currentState = "elon_tweet";
		updateOutput("Elon’s Tweet Challenge! Choose a response. 🚀");
		updateButtons([
			["Yes, Elon!", () => {
				player.money += 50;
				player.political -= 10;
				updateOutput("Agreed with Elon—+50 Money, -10 Political. Such vibe, wow! 🚀", true);
				updateStatus();
				setState("start_turn");
			}],
			["No, Elon!", () => {
				player.political += 20;
				player.manpower -= 15;
				updateOutput("Disagreed with Elon—+20 Political, -15 Manpower. Bold move, fren! 🚀", true);
				updateStatus();
				setState("start_turn");
			}]
		]);
	}

	function bustFraud(frac) {
		const action = frac === 0 ? fraudActions[0] : fraudActions[1];
		const costStr = `Cost: ${action.cost.money}M, ${action.cost.political}P, ${action.cost.manpower}MP`;
		if (player.money >= action.cost.money && player.political >= action.cost.political && player.manpower >= action.cost.manpower) {
			player.money -= action.cost.money;
			player.political -= action.cost.political;
			player.manpower -= action.cost.manpower;
			const recovery = Math.floor(Math.random() * (action.recovery[1] - action.recovery[0] + 1)) + action.recovery[0];
			const reduction = Math.floor(Math.random() * (action.reduction[1] - action.reduction[0] + 1)) + action.reduction[0];
			player.money += recovery;
			agencies.forEach(a => a.inefficiency = Math.max(0, a.inefficiency - reduction / agencies.length));
			playSiren();
			const quip = quips[Math.floor(Math.random() * quips.length)];
			updateOutput(`${action.name}! ${costStr}. Recovered ${recovery}M, reduced inefficiency by ${reduction}—${quip} 💰🚨`, true);
		} else {
			updateOutput(`Such sad! ${costStr} needed, but resources are low.`, true);
		}
		updateStatus();
		setState("start_turn");
	}

	function shareScore() {
		const inefficiency = totalInefficiency();
		const turns = player.turn;
		const tweetText = `I’m the Efficiency Lord! Reduced inefficiency to ${inefficiency} in ${turns} turns! ⚖️💰🚀🇺🇸 Beat me? #DOGELord #ElonVibes #EfficiencyGame`;
		const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=https://medinajulioc.github.io/doge-lord-game/`;
		window.open(tweetUrl, '_blank');
	}

	function restartGame() {
		agencies.forEach((a, i) => { a.inefficiency = [60, 75, 50][i]; a.reforms = []; });
		player = { money: 500, political: 100, manpower: 100, turn: 1 };
		output.innerHTML = "Welcome back to DOGE Lord! Reduce inefficiency below 100 in 30 turns.";
		updateStatus();
		setState("start_turn");
	}

	function setState(state) {
		currentState = state;
		if (state === "start_turn") {
			const reformButtons = agencies.map((a, i) => [`Reform ${a.name}`, () => reformAgency(i)]);
			const efficiencyButtons = strategies.map((s, i) => [`${s.name} Efficiency`, () => applyStrategy(s, i % agencies.length)]);
			const fraudButtons = fraudActions.map((f, i) => [`${f.name}`, () => bustFraud(i)]);
			updateButtons(reformButtons.concat([
				["Manage Resources", manageResources],
				["Hack Bureaucracy", hackBureaucracy],
				["Elon’s Tweet Challenge", elonTweetChallenge],
				["End Turn", endTurn]
			]).concat(efficiencyButtons).concat(fraudButtons));
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