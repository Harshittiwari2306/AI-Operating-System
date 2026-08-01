import re
from typing import Dict, Any, Optional

class SpeechCommandInterpreter:
    @staticmethod
    def interpret(transcript: str) -> Dict[str, Any]:
        """Translates spoken text sentences into structured OS operations."""
        text = transcript.lower().strip()
        
        # 1. Matches: "add task [title]" or "create task [title]"
        task_match = re.match(r"(?:add|create)\s+task\s+(.+)", text)
        if task_match:
            title = task_match.group(1).strip()
            # Simple priority tagging based on keywords
            priority = "High" if "urgent" in title or "important" in title else "Medium"
            return {
                "action": "create_task",
                "params": {
                    "title": title.capitalize(),
                    "priority": priority,
                    "category": "Voice Import"
                },
                "feedback": f"Adding task: {title.capitalize()} with {priority} priority."
            }
            
        # 2. Matches: "add event [title] at [time]" or "create event [title]"
        event_match = re.match(r"(?:add|create)\s+event\s+(.+)", text)
        if event_match:
            parts = event_match.group(1).split(" at ")
            title = parts[0].strip().capitalize()
            time_desc = parts[1].strip() if len(parts) > 1 else "tomorrow"
            return {
                "action": "create_event",
                "params": {
                    "title": title,
                    "description": f"Scheduled via voice assistant. Time suggested: {time_desc}"
                },
                "feedback": f"Scheduling event: '{title}' at '{time_desc}'."
            }
            
        # 3. Matches: "track expense [amount] for [category]"
        expense_match = re.match(r"track\s+expense\s+(\d+(?:\.\d+)?)\s+(?:for|on|in)?\s*(.+)", text)
        if expense_match:
            amount = float(expense_match.group(1))
            category = expense_match.group(2).strip().capitalize()
            return {
                "action": "track_expense",
                "params": {
                    "amount": amount,
                    "type": "expense",
                    "category": category,
                    "description": "Logged via voice assistant."
                },
                "feedback": f"Logged expense of ${amount:.2f} under {category}."
            }
            
        # 4. Matches: "track water" or "log exercise"
        habit_match = re.match(r"(?:track|log|complete)\s+(water|exercise|sleep|reading|coding|meditation)", text)
        if habit_match:
            category = habit_match.group(1).strip().capitalize()
            return {
                "action": "log_habit",
                "params": {
                    "category": category
                },
                "feedback": f"Updated your daily completion for {category}."
            }
            
        # 5. General Queries
        if "dashboard" in text or "show overview" in text:
            return {
                "action": "navigate",
                "params": {"page": "/dashboard"},
                "feedback": "Navigating to dashboard."
            }
        elif "calendar" in text or "show schedule" in text:
            return {
                "action": "navigate",
                "params": {"page": "/calendar"},
                "feedback": "Navigating to calendar."
            }
        elif "notes" in text or "show notes" in text:
            return {
                "action": "navigate",
                "params": {"page": "/notes"},
                "feedback": "Navigating to notes."
            }
            
        # Default fallback: Send query to the Chatbot Assistant
        return {
            "action": "chat_query",
            "params": {"query": transcript},
            "feedback": "Let me search your brain workspace for that..."
        }
