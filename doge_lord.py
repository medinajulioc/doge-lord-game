from browser import document, window, bind
import random

# Game Classes
class Agency:
	def __init__(self, name, inefficiency):
		self.name = name
		self.inefficiency = inefficiency
		self.reforms_applied = []

class Strategy:
	def __init__(self, name, cost_money, cost_political, cost_manpower, benefit_min, benefit_max, risk, unethical):
		self.name = name
		self.cost_money = cost_money
		self.cost_political = cost_political
		self.cost_manpower = cost_manpower
		self.benefit_min = benefit_min
		self.benefit_max = benefit_max
		self.risk = risk
		self.unethical = unethical

class Player:
	def __init__(self, money, political_capital, manpower):
		self.money = money
		self.political_capital = political_capital
		self.manpower = manpower
		self.suspicion = 0

# Game Data
agencies = [
	Agency("Transportation", 60),
	Agency("Education", 75),
	Agency("Defense", 50)
]
strategies = [
	Strategy("Reengineering", 100, 20, 50, 10, 20, 20, False),
	Strategy("Tech Upgrade", 150, 10, 30, 15, 25, 30, False),
	Strategy("Training", 50, 5, 20, 5, 10, 10, False),
	Strategy("Cut Corners", 20, 0, 10, 15, 30, 50, True),
	Strategy("Bribe", 200, 10, 0, 20, 40, 40, True)
]
player = Player(500, 100, 100)
events = [
	("Budget Cut", lambda: setattr(player, 'money', max(0, player.money - 50))),
	("Scandal", lambda: setattr(player, 'political_capital', max(0, player.political_capital - 20))),
	("Disaster", lambda: random.choice(agencies).inefficiency += 10),
	("Support", lambda: player.political_capital += 20),
	("Breakthrough", lambda: random.choice(strategies).cost_money *= 0.8)
]
turn = 1

# Game Logic
def total_inefficiency():
	return sum(agency.inefficiency for agency in agencies)

def view_agency(index):
	if 0 <= index < len(agencies):
		agency = agencies[index]
		return f"{agency.name}\nInefficiency: {agency.inefficiency}\nReforms: {', '.join(agency.reforms_applied) or 'None'}"
	return "Invalid agency number."

def implement_reform(agency_idx, strategy_idx):
	if 0 <= agency_idx < len(agencies) and 0 <= strategy_idx < len(strategies):
		agency = agencies[agency_idx]
		strategy = strategies[strategy_idx]
		if player.money >= strategy.cost_money and player.political_capital >= strategy.cost_political and player.manpower >= strategy.cost_manpower:
			player.money -= strategy.cost_money
			player.political_capital -= strategy.cost_political
			player.manpower -= strategy.cost_manpower
			if strategy.unethical:
				player.suspicion += 20
			if random.random() < (1 - strategy.risk / 100):
				benefit = random.uniform(strategy.benefit_min, strategy.benefit_max)
				agency.inefficiency = max(0, agency.inefficiency - benefit)
				agency.reforms_applied.append(strategy.name)
				return f"Success! {agency.name} inefficiency reduced by {benefit:.1f}"
			return "Reform failed."
		return "Not enough resources."
	return "Invalid agency or strategy."

def manage_resources(option):
	if option == "1" and player.money >= 50:
		player.money -= 50
		player.manpower += 20
		return "Hired staff. +20 manpower."
	elif option == "2" and player.political_capital >= 20:
		player.political_capital -= 20
		player.money += 100
		return "Lobbied. +100 money."
	elif option == "3" and player.manpower >= 30:
		player.manpower -= 30
		player.political_capital += 10
		return "Alliances. +10 political capital."
	return "Invalid or insufficient resources."

def end_turn():
	global turn
	output = ""
	if random.random() < 0.2:
		event_name, effect = random.choice(events)
		output += f"Event: {event_name}\n"
		effect()
	if random.random() < 0.1 and player.suspicion > 50:
		output += "Elon caught you! -100 money, -20 political capital.\n"
		player.money = max(0, player.money - 100)
		player.political_capital = max(0, player.political_capital - 20)
		for agency in agencies:
			agency.inefficiency += 5
		player.suspicion = 0
	player.suspicion = max(0, player.suspicion - 5)
	turn += 1
	if turn > 30:
		inefficiency = total_inefficiency()
		output += f"Game Over. Total inefficiency: {inefficiency}\n"
		output += "You win!" if inefficiency < 100 else "You lose!"
	return output

# Update UI
def update_game_state():
	document['turn'].text = str(turn)
	document['money'].text = str(player.money)
	document['political'].text = str(player.political_capital)
	document['manpower'].text = str(player.manpower)

def update_output(text):
	document['output'].innerHTML += f"<br>{text}"
	document['output'].scrollTop = document['output'].scrollHeight

# Process Input
def process_command(cmd):
	parts = cmd.split()
	output = ""
	if not parts:
		output = "Enter a command."
	elif parts[0] == "view" and len(parts) == 2:
		try:
			output = view_agency(int(parts[1]) - 1)
		except ValueError:
			output = "Use a number (e.g., view 1)."
	elif parts[0] == "reform" and len(parts) == 3:
		try:
			output = implement_reform(int(parts[1]) - 1, int(parts[2]) - 1)
		except ValueError:
			output = "Use numbers (e.g., reform 1 2)."
	elif parts[0] == "manage" and len(parts) == 2:
		output = manage_resources(parts[1])
	elif parts[0] == "end":
		output = end_turn()
	else:
		output = "Invalid command. Try view, reform, manage, or end."
	update_output(output)
	update_game_state()

# Bind Input
@bind('#command', 'keyup')
def keyup(ev):
	if ev.key == "Enter":
		process_command(document['command'].value)
		document['command'].value = ""

# Initialize
update_game_state()