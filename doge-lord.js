const output = document.getElementById('output');
const buttonsContainer = document.getElementById('buttons');

const agencies = [
    { name: "Transportation", inefficiency: 60, reforms: [] },
    { name: "Education", inefficiency: 75, reforms: [] },
    { name: "Defense", inefficiency: 50, reforms: [] }
];
const strategies = ["Process Reengineering", "Technology Upgrade", "Staff Training"];
let player = { turn: 1, money: 500, political: 100, manpower: 100, maxTurns: 30 };

// Elon-style zingers (unhinged, meme-driven, efficiency-related)
const zingers = [
    "This inefficiency is so 2020—let’s Tesla-ize it, yo! 🚀",
    "Nuke Mars vibes, cut that red tape! 🇺🇸💥",
    "Dogecoin efficiency, much wow—get to work! 💰",
    "I’m tweeting this save, patriots—such savings! 🚀",
    "SpaceX vibes: Efficiency or bust, fam! 🚀🇺🇸",
    "Bureaucracy? More like boring-cracy—zap it! 💥",
    "Elon says: To the moon with inefficiency! 🚀💰",
    "Neuralink’s watching, cut that waste, wow! 🇺🇸",
    "Tesla mode engaged—efficiency on steroids! 🚀",
    "Cybertruck efficiency, no red tape allowed! 💥"
];

function appendOutput(text) {
    output.innerHTML += `<p>${text}</p>`;
    output.scrollTop = output.scrollHeight;
    addZinger(); // Add an Elon zinger after each action
}

function addZinger() {
    const zinger = zingers[Math.floor(Math.random() * zingers.length)];
    output.innerHTML += `<p>Elon Zinger: ${zinger}</p>`;
    output.scrollTop = output.scrollHeight;
}

function updateStats() {
    document.getElementById('turn').textContent = player.turn;
    document.getElementById('money').textContent = player.money;
    document.getElementById('political').textContent = player.political;
    document.getElementById('manpower').textContent = player.manpower;
    document.getElementById('inefficiency').textContent = totalInefficiency();
}

function totalInefficiency() {
    return agencies.reduce((sum, agency) => sum + agency.inefficiency, 0);
}

function createButton(text, onClick, className = '') {
    const button = document.createElement('button');
    button.className = `retro-button ${className}`;
    button.textContent = text;
    button.onclick = () => {
        onClick();
        trackEvent('button_click', text);
    };
    button.setAttribute('aria-label', text);
    return button;
}

function clearButtons() {
    buttonsContainer.innerHTML = '';
    buttonsContainer.style.display = 'none';
}

function showButtons(buttons) {
    clearButtons();
    buttonsContainer.style.display = 'flex';
    buttons.forEach(([text, callback, className]) => buttonsContainer.appendChild(createButton(text, callback, className)));
}

function showMainButtons() {
    showButtons([
        ["View Agencies", showViewAgencies],
        ["Reform Agency", showReformAgency],
        ["Manage Resources", showManageResources],
        ["End Turn", endTurn, 'end-turn-button']
    ]);
}

function showViewAgencies() {
    showButtons(agencies.map((agency, index) => [agency.name, () => viewAgency(index)]).concat([["Back", showMainButtons]]));
    trackEvent('view_action', 'View Agencies');
}

function showReformAgency() {
    showButtons(agencies.map((agency, index) => [agency.name, () => reformAgency(index)]).concat([["Back", showMainButtons]]));
    trackEvent('view_action', 'Reform Agency');
}

function showManageResources() {
    showButtons([
        ["Hire Consultants (50M -> 20MP)", () => {
            if (player.money >= 50) {
                player.money -= 50;
                player.manpower += 20;
                appendOutput('Hired consultants: -50 Money, +20 Manpower.');
                updateStats();
                trackEvent('resource_action', 'Hire Consultants');
            } else {
                appendOutput('Not enough Money (50 needed).');
            }
            showMainButtons();
        }],
        ["Back", showMainButtons]
    ]);
    trackEvent('view_action', 'Manage Resources');
}

function viewAgency(index) {
    const agency = agencies[index];
    appendOutput(`Agency: ${agency.name}\nInefficiency: ${agency.inefficiency}\nReforms: ${agency.reforms.join(', ') || 'None'}.`);
    trackEvent('game_action', `View ${agency.name}`);
    showMainButtons();
}

function reformAgency(index) {
    showButtons(strategies.map(strategy => [
        strategy,
        () => {
            if (player.money >= 100 && player.political >= 20 && player.manpower >= 50) {
                player.money -= 100;
                player.political -= 20;
                player.manpower -= 50;
                agencies[index].reforms.push(strategy);
                agencies[index].inefficiency -= 10;
                appendOutput(`Applied ${strategy} to ${agencies[index].name}. Inefficiency reduced by 10.`);
                updateStats();
                trackEvent('game_action', `Reform ${agencies[index].name} with ${strategy}`);
            } else {
                appendOutput('Insufficient resources (100M, 20P, 50MP needed).');
            }
            showMainButtons();
        }
    ]).concat([["Back", showReformAgency]]));
    trackEvent('view_action', `Reform ${agencies[index].name}`);
}

function endTurn() {
    player.turn++;
    appendOutput(`Turn ${player.turn} begins.`);
    if (Math.random() < 0.2) {
        const events = [
            "Budget Cut! -50 Money.",
            "Elon Tweets! +20 Political.",
            "Worker Strike! -30 Manpower."
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        if (event.includes("-50 Money")) player.money = Math.max(0, player.money - 50);
        else if (event.includes("+20 Political")) player.political += 20;
        else if (event.includes("-30 Manpower")) player.manpower = Math.max(0, player.manpower - 30);
        appendOutput(event);
    }
    updateStats();
    trackEvent('game_action', 'End Turn');
    if (totalInefficiency() < 100) {
        appendOutput("Victory! Inefficiency below 100. You’re the DOGE Lord! 🇺🇸");
        showGameOver();
        trackEvent('game_outcome', 'Victory');
    } else if (player.turn > player.maxTurns) {
        appendOutput("Game Over! Too many turns. Try again!");
        showGameOver();
        trackEvent('game_outcome', 'Loss');
    } else {
        showMainButtons();
    }
}

function showGameOver() {
    clearButtons();
    buttonsContainer.style.display = 'flex';
    buttonsContainer.appendChild(createButton('Play Again', () => {
        restartGame();
        trackEvent('button_click', 'Play Again');
    }));
}

function restartGame() {
    agencies.forEach(a => { a.inefficiency = [60, 75, 50][agencies.indexOf(a)]; a.reforms = []; });
    player = { turn: 1, money: 500, political: 100, manpower: 100, maxTurns: 30 };
    output.innerHTML = 'Welcome to DOGE Lord! Reduce inefficiency below 100 in 30 turns.';
    updateStats();
    showMainButtons();
    trackEvent('game_action', 'Restart');
}

// Google Analytics tracking function
function trackEvent(eventName, eventParameter) {
    if (window.gtag) {
        gtag('event', eventName, {
            event_category: 'DOGE Lord',
            event_label: eventParameter,
            value: 1
        });
    } else {
        console.log(`Tracking event: ${eventName} - ${eventParameter}`);
    }
}

// Initialize
updateStats();
showMainButtons();
trackEvent('page_view', 'DOGE Lord Game');
