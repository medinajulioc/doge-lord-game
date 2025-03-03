from browser import document, window, bind
import random

# Classes
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

# Functions
def total_inefficiency(agencies):
	return sum(agency.inefficiency for agency in agencies)

def view_agency_details():
	output = "Select an agency to view details:\n"
	for i, agency in enumerate(agencies):
		output += f"{i+1}. {agency.name}\n"
	choice = input("Choose agency number: ")
	try:
		index = int(choice) - 1
		if 0 <= index < len(agencies):
			agency = agencies[index]
			output += f"\n{agency.name}\nInefficiency: {agency.inefficiency}\nReforms applied: {', '.join(agency.reforms_applied) or 'None'}"
		else:
			output += "Invalid agency number."
	except ValueError:
		output += "Please enter a number."
	return output

def implement_reform():
	output = "Select an agency to reform:\n"
	for i, agency in enumerate(agencies):
		output += f"{i+1}. {agency.name}\n"
	agency_choice = input("Choose agency number: ")
	try:
		agency_index = int(agency_choice) - 1
		if 0 <= agency_index < len(agencies):
			agency = agencies[agency_index]
			output += "\nAvailable strategies:\n"
			for j, strategy in enumerate(strategies):
				output += f"{j+1}. {strategy.name} - Cost: {strategy.cost_money} money, {strategy.cost_political} political, {strategy.cost_manpower} manpower\n"
			strategy_choice = input("Choose strategy number: ")
			try:
				strategy_index = int(strategy_choice) - 1
				if 0 <= strategy_index < len(strategies):
					strategy = strategies[strategy_index]
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
							output += f"Reform successful! {agency.name} inefficiency reduced by {benefit:.2f}"
						else:
							output += "Reform failed. Resources spent with no effect."
					else:
						output += "Not enough resources to implement this strategy."
				else:
					output += "Invalid strategy number."
			except ValueError:
				output += "Please enter a number."
		else:
			output += "Invalid agency number."
	except ValueError:
		output += "Please enter a number."
	return output

def manage_resources():
	output = "Resource management options:\n1. Hire Staff: Spend 50 money to gain 20 manpower\n2. Lobby for Funding: Spend 20 political capital to gain 100 money\n3. Build Alliances: Spend 30 manpower to gain 10 political capital\n"
	choice = input("Choose an option (1-3): ")
	if choice == "1":
		if player.money >= 50:
			player.money -= 50
			player.manpower += 20
			output += "Hired staff. Gained 20 manpower."
		else:
			output += "Not enough money."
	elif choice == "2":
		if player.political_capital >= 20:
			player.political_capital -= 20
			player.money += 100
			output += "Lobbied for funding. Gained 100 money."
		else:
			output += "Not enough political capital."
	elif choice == "3":
		if player.manpower >= 30:
			player.manpower -= 30
			player.political_capital += 10
			output += "Built alliances. Gained 10 political capital."
		else:
			output += "Not enough manpower."
	else:
		output += "Invalid choice."
	return output

def end_turn():
	global turn
	output = ""
	if random.random() < 0.2:
		event_name, event_effect = random.choice(events)
		output += f"Random event: {event_name}\n"
		event_effect()
	if random.random() < 0.1:
		output += "Elon is investigating...\n"
		if player.suspicion > 50:
			output += "Elon caught you! You lose 100 money and 20 political capital.\n"
			player.money = max(0, player.money - 100)
			player.political_capital = max(0, player.political_capital - 20)
			for agency in agencies:
				agency.inefficiency += 5
			player.suspicion = 0
		else:
			output += "Elon found nothing suspicious.\n"
	player.suspicion = max(0, player.suspicion - 5)
	turn += 1
	if turn > 30:
		total_ineff = total_inefficiency(agencies)
		if total_ineff < 100:
			output += "\nCongratulations! You have successfully reduced total inefficiency below 100."
		else:
			output += f"\nGame over. Total inefficiency is {total_ineff}, which is above 100."
		document["tweet-button"].style.display = "block"  # Show tweet button
	return output

# Game Setup
agencies = [
	Agency("Department of Transportation", 60),
	Agency("Department of Education", 75),
	Agency("Department of Defense", 50)
]

strategies = [
	Strategy("Process Reengineering", 100, 20, 50, 10, 20, 20, False),
	Strategy("Technology Upgrade", 150, 10, 30, 15, 25, 30, False),
	Strategy("Staff Training", 50, 5, 20, 5, 10, 10, False),
	Strategy("Cut Corners", 20, 0, 10, 15, 30, 50, True),
	Strategy("Bribe Officials", 200, 10, 0, 20, 40, 40, True)
]

player = Player(500, 100, 100)

events = [
	("Budget Cut", lambda: setattr(player, 'money', max(0, player.money - 50))),
	("Scandal", lambda: setattr(player, 'political_capital', max(0, player.political_capital - 20))),
	("Natural Disaster", lambda: random.choice(agencies).inefficiency += 10),
	("Public Support", lambda: player.political_capital += 20),
	("Technological Breakthrough", lambda: random.choice(strategies).cost_money *= 0.8)
]

# Game Variables
turn = 1
animations_enabled = True

# Update Display
def update_game_state():
	document['turn'].textContent = str(turn)
	document['money'].textContent = str(player.money)
	document['political'].textContent = str(player.political_capital)
	document['manpower'].textContent = str(player.manpower)

# Process Commands
def process_command(cmd):
	output = ""
	if cmd == "1":
		output = view_agency_details()
	elif cmd == "2":
		output = implement_reform()
	elif cmd == "3":
		output = manage_resources()
	elif cmd == "4":
		output = end_turn()
	else:
		output = "Invalid choice."
	update_output(output)
	update_game_state()

# Show Text with Typing Effect
def update_output(text):
	output = document['output']
	if animations_enabled:
		span = document.createElement('span')
		span.className = 'typing'
		span.textContent = text
		span.bind('animationend', lambda event: event.target.classList.remove('typing'))
		output <= span
	else:
		output.textContent += text
	output.scrollTop = output.scrollHeight

# Toggle Animations
@bind(document['toggle-animations'], 'click')
def toggle_animations(event):
	global animations_enabled
	animations_enabled = not animations_enabled
	cursor = document.querySelector('.cursor')
	if animations_enabled:
		cursor.classList.add('blink')
	else:
		cursor.classList.remove('blink')

# Tweet Functionality
def tweet_score():
	total_ineff = total_inefficiency(agencies)
	tweet_text = f"I just played DOGE Lord and reduced inefficiency to {total_ineff}! Can you beat me? #DOGELord Play now: https://github.com/medinajulioc/doge-lord-game"
	tweet_url = f"https://x.com/intent/tweet?text={tweet_text}"
	window.open(tweet_url, "_blank")

document["tweet-button"].bind("click", tweet_score)

# Handle Input
@bind(document['command'], 'keyup')
def on_keyup(event):
	if event.key == 'Enter':
		cmd = document['command'].value
		process_command(cmd)
		document['command'].value = ''

# Start the Game
update_game_state()