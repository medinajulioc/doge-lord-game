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

const quips = [
	"Bureaucracy obliterated—such chaos, much savings! 🚀",
	"Government red tape shredded—To the moon, such efficiency! 🐶🚀",
	"Politicians baffled, taxpayers cheering—This is unhinged DOGE magic! 🇺🇸",
	"Elon’s watching, much wow—Save more or face the audit wrath! 😅",
	"Such savings, wow—Efficiency gone wild! 🐶💥",
	"Red tape? More like red shred—DOGE Lord strikes again! 🚀"
];

function updateOutput(text, isConfirmation = false) {
	const span = document.createElement('span');
	span.textContent = text;
	if (isConfirmation) span.className = 'confirmation';
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

function createButton(label, callback) {
	const button = document.createElement('button');
	button.textContent = label;
	button.className = 'retro-button';
	button.addEventListener('click', () => {
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
		const quip = random.choice(quips);
		updateOutput(`Applied ${strategy.name} to ${agency.name}! ${costStr}. Inefficiency slashed by ${reduction}—${quip}`, true);
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
		const quip = random.choice(quips);
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
			() => { player.political += 20; eventOutput = "Elon Tweets! +20 political capital. 🐶🚀"; }
		];
		random.choice(events)();
	}
	updateStatus();
	if (totalInefficiency() < 100) {
		updateOutput("Victory!