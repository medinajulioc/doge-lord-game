from browser import document, window
import random

# Game state
agencies = [
	{"name": "Transportation", "inefficiency": 60, "reforms": []},
	{"name": "Education", "inefficiency": 75, "reforms": []},
	{"name": "Defense", "inefficiency": 50, "reforms": []}
]
strategies = [
	{"name": "Process Reengineering", "cost": {"money": 100, "political": 20, "manpower": 50}, "reduction": (10, 20)},
	{"name": "Technology Upgrade", "cost": {"money": 150, "political": 10, "manpower": 30}, "reduction": (15, 25)},
	{"name": "Staff Training", "cost": {"money": 50, "political": 5, "manpower": 20}, "reduction": (5, 10)}
]
player = {"money": 500, "political": 100, "manpower": 100, "turn": 1}
current_state = "start_turn"
current_agency = None

# Helper functions
def total_inefficiency():
	return sum(agency["inefficiency"] for agency in agencies)

def update_output(text):
	document["output"].innerHTML += f"<br>{text}"

def update_status():
	document["turn"].text = str(player["turn"])
	document["money"].text = str(player["money"])
	document["political"].text = str(player["political"])
	document["manpower"].text = str(player["manpower"])
	document["inefficiency"].text = str(total_inefficiency())

def create_button(label, callback):
	btn = document.createElement("button")
	btn.text = label
	btn.className = "retro-button"
	btn.bind("click", callback)
	return btn

def update_buttons(buttons):
	buttons_div = document["buttons"]
	buttons_div.clear()
	for btn in buttons:
		buttons_div <= btn

# Game actions
def reform_agency(agency_index):
	global current_state, current_agency
	current_state = "choose_strategy"
	current_agency = agency_index
	buttons = [create_button(f"{s['name']} (Cost: {s['cost']['money']}M, {s['cost']['political']}P, {s['cost']['manpower']}MP)", lambda s=s: apply_strategy(s, agency_index)) for s in strategies] + [create_button("Back", lambda: set_state("start_turn"))]
	update_buttons(buttons)

def apply_strategy(strategy, agency_index):
	agency = agencies[agency_index]
	if all(player[res] >= strategy["cost"][res] for res in ["money", "political", "manpower"]):
		for res in ["money", "political", "manpower"]:
			player[res] -= strategy["cost"][res]
		reduction = random.randint(*strategy["reduction"])
		agency["inefficiency"] = max(0, agency["inefficiency"] - reduction)
		update_output(f"Much wow! Applied {strategy['name']} to {agency['name']}. Reduced inefficiency by {reduction}.")
	else:
		update_output("Such sad! Not enough resources.")
	update_status()
	set_state("start_turn")

def manage_resources():
	global current_state
	current_state = "manage_resources"
	options = [
		("Hire Consultants (50M -> 20MP)", lambda: trade_resources("money", 50, "manpower", 20)),
		("Lobby Politicians (20P -> 100M)", lambda: trade_resources("political", 20, "money", 100)),
		("Train Staff (30MP -> 10P)", lambda: trade_resources("manpower", 30, "political", 10))
	]
	buttons = [create_button(opt[0], opt[1]) for opt in options] + [create_button("Back", lambda: set_state("start_turn"))]
	update_buttons(buttons)

def trade_resources(from_res, from_amt, to_res, to_amt):
	if player[from_res] >= from_amt:
		player[from_res] -= from_amt
		player[to_res] += to_amt
		update_output(f"Very trade! Exchanged {from_amt} {from_res} for {to_amt} {to_res}.")
	else:
		update_output(f"No can do! Need more {from_res}.")
	update_status()
	set_state("start_turn")

def end_turn():
	player["turn"] += 1
	if random.random() < 0.2:
		events = [
			lambda: (player["money"] := max(0, player["money"] - 50), update_output("Budget Cut! Lost 50 money.")),
			lambda: (player["political"] := max(0, player["political"] - 20), update_output("Political Scandal! -20 political capital.")),
			lambda: (player["manpower"] := max(0, player["manpower"] - 30), update_output("Worker Strike! -30 manpower.")),
			lambda: (player["money"] += 100, update_output("Economic Boom! +100 money.")),
			lambda: (player["political"] += 20, update_output("Elon Tweets! +20 political capital."))
		]
		random.choice(events)()
	update_status()
	if total_inefficiency() < 100:
		update_output("Victory! You reduced inefficiency below 100. Such DOGE Lord!")
		set_state("game_over")
	elif player["turn"] > 30:
		update_output("Game Over! Time’s up, inefficiency remains. Try again, fren!")
		set_state("game_over")
	else:
		set_state("start_turn")

def share_score():
	inefficiency = total_inefficiency()
	turns = player["turn"]
	tweet_text = f"I’m the DOGE Lord! Reduced inefficiency to {inefficiency} in {turns} turns! 🐶🚀🇺🇸 Beat me? #DOGELord #ToTheMoon"
	tweet_url = f"https://twitter.com/intent/tweet?text={tweet_text}&url=https://medinajulioc.github.io/doge-lord-game/"
	window.open(tweet_url, "_blank")

def restart_game():
	global agencies, player, current_state
	agencies = [
		{"name": "Transportation", "inefficiency": 60, "reforms": []},
		{"name": "Education", "inefficiency": 75, "reforms": []},
		{"name": "Defense", "inefficiency": 50, "reforms": []}
	]
	player = {"money": 500, "political": 100, "manpower": 100, "turn": 1}
	document["output"].innerHTML = "Welcome back to DOGE Lord! Reduce inefficiency below 100 in 30 turns."
	update_status()
	set_state("start_turn")

# State management
def set_state(state):
	global current_state
	current_state = state
	if state == "start_turn":
		buttons = [create_button(f"Reform {a['name']}", lambda i=i: reform_agency(i)) for i, a in enumerate(agencies)] + [create_button("Manage Resources", manage_resources), create_button("End Turn", end_turn)]
		update_buttons(buttons)
	elif state == "choose_strategy":
		buttons = [create_button(f"{s['name']} (Cost: {s['cost']['money']}M, {s['cost']['political']}P, {s['cost']['manpower']}MP)", lambda s=s: apply_strategy(s, current_agency)) for s in strategies] + [create_button("Back", lambda: set_state("start_turn"))]
		update_buttons(buttons)
	elif state == "manage_resources":
		options = [
			("Hire Consultants (50M -> 20MP)", lambda: trade_resources("money", 50, "manpower", 20)),
			("Lobby Politicians (20P -> 100M)", lambda: trade_resources("political", 20, "money", 100)),
			("Train Staff (30MP -> 10P)", lambda: trade_resources("manpower", 30, "political", 10))
		]
		buttons = [create_button(opt[0], opt[1]) for opt in options] + [create_button("Back", lambda: set_state("start_turn"))]
		update_buttons(buttons)
	elif state == "game_over":
		buttons = [create_button("Share Score on X", share_score), create_button("Play Again", restart_game)]
		update_buttons(buttons)

# Initialize game
set_state("start_turn")
update_status()