from browser import document, bind
import random

# Game state (simplified for example)
agencies = [
    {"name": "Transportation", "inefficiency": 60, "reforms": []},
    {"name": "Education", "inefficiency": 75, "reforms": []},
    {"name": "Defense", "inefficiency": 50, "reforms": []}
]
player = {"money": 500, "political": 100, "manpower": 100, "turn": 1, "suspicion": 0}

def update_output(text):
    """Append text to the output area and scroll to the bottom."""
    output = document["output"]
    output.innerHTML += f"{text}<br>"
    output.scrollTop = output.scrollHeight

def view_agency(index):
    """Return details of an agency."""
    if 0 <= index < len(agencies):
        agency = agencies[index]
        return f"{agency['name']}\nInefficiency: {agency['inefficiency']}\nReforms: {', '.join(agency['reforms']) or 'None'}"
    return "Invalid agency number."

def process_command(cmd):
    """Process user commands."""
    parts = cmd.strip().split()
    if not parts:
        return "Enter a command."
    elif parts[0].lower() == "view" and len(parts) == 2:
        try:
            index = int(parts[1]) - 1
            return view_agency(index)
        except ValueError:
            return "Use a number (e.g., view 1)."
    elif parts[0].lower() == "reform" and len(parts) == 3:
        return "Reform command received (logic to be implemented)."
    elif parts[0].lower() == "manage" and len(parts) == 2:
        return "Manage command received (logic to be implemented)."
    elif parts[0].lower() == "end":
        return "End turn command received (logic to be implemented)."
    else:
        return "Invalid command. Try 'view <number>', 'reform <agency> <strategy>', 'manage <option>', or 'end'."

@bind("#command", "keyup")
def keyup(ev):
    """Handle Enter key press."""
    if ev.key == "Enter":
        cmd = document["command"].value
        response = process_command(cmd)
        update_output(response)
        document["command"].value = ""  # Clear input after processing

# Focus input on load
document["command"].focus()
