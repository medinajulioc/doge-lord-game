from browser import document, bind

agencies = [
	{"name": "Transportation", "inefficiency": 60, "reforms": []},
	{"name": "Education", "inefficiency": 75, "reforms": []},
	{"name": "Defense", "inefficiency": 50, "reforms": []}
]
player = {"money": 500, "political": 100, "manpower": 100, "turn": 1}

def update_output(text):
	output = document["output"]
	output.innerHTML += f"{text}<br>"
	output.scrollTop = output.scrollHeight

def view_agency(index):
	if 0 <= index < len(agencies):
		agency = agencies[index]
		return f"{agency['name']}\nInefficiency: {agency['inefficiency']}\nReforms: {', '.join(agency['reforms']) or 'None'}"
	return "Invalid agency number."

def process_command(cmd):
	parts = cmd.strip().split()
	if not parts:
		return "Enter a command."
	elif parts[0].lower() == "view" and len(parts) == 2:
		try:
			index = int(parts[1]) - 1
			return view_agency(index)
		except ValueError:
			return "Use a number (e.g., view 1)."
	else:
		return "Invalid command. Try 'view <number>'."

@bind("#command", "keyup")
def keyup(ev):
	if ev.key == "Enter":
		cmd = document["command"].value
		response = process_command(cmd)
		update_output(response)
		document["command"].value = ""

document["command"].focus()