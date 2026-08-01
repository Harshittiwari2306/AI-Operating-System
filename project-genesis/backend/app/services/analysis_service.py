import datetime
from typing import List, Dict, Any, Tuple
import numpy as np

class FinancePredictor:
    @staticmethod
    def forecast_expenses(expenses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Projects next month's expenses using historic spending trends."""
        exp_only = [e for e in expenses if e.get("type") == "expense"]
        if not exp_only:
            return {"predicted_next_month": 0.0, "trend": "Stable", "confidence": "Low"}
            
        # Group by date
        daily_totals = {}
        for e in exp_only:
            # Parse date safely
            d = e.get("date")
            if isinstance(d, datetime.datetime):
                d_str = d.strftime("%Y-%m-%d")
            else:
                d_str = str(d)[:10]
            daily_totals[d_str] = daily_totals.get(d_str, 0.0) + e.get("amount", 0.0)
            
        # Sort dates
        sorted_dates = sorted(daily_totals.keys())
        amounts = [daily_totals[day] for day in sorted_dates]
        
        # Simple linear fit if enough points, otherwise average
        if len(amounts) >= 3:
            x = np.arange(len(amounts))
            y = np.array(amounts)
            slope, intercept = np.polyfit(x, y, 1)
            # Forecast next 30 days based on final values
            last_val = slope * len(amounts) + intercept
            projected = max(0.0, (last_val + (slope * 15)) * 30 / len(amounts)) # Extrapolate monthly rate
            trend = "Rising" if slope > 0.1 else ("Falling" if slope < -0.1 else "Stable")
            confidence = "Medium" if len(amounts) < 10 else "High"
        else:
            avg_daily = sum(amounts) / max(1, len(amounts))
            projected = avg_daily * 30
            trend = "Stable"
            confidence = "Low"
            
        return {
            "predicted_next_month": round(projected, 2),
            "trend": trend,
            "confidence": confidence
        }


class HabitPredictor:
    @staticmethod
    def analyze_habit(completions: List[str], target_frequency: int) -> Dict[str, Any]:
        """Calculates consistency statistics, streaks, and future completion likelihood."""
        if not completions:
            return {"consistency_rate": 0, "predicted_completion_rate": 20, "recommendation": "Start small: try to complete it once this week."}
            
        # Clean & unique list
        unique_dates = sorted(list(set(completions)))
        
        # Calculate completion rate in the last 14 days
        today = datetime.date.today()
        recent_count = 0
        for d_str in unique_dates:
            try:
                d = datetime.datetime.strptime(d_str, "%Y-%m-%d").date()
                if (today - d).days <= 14:
                    recent_count += 1
            except ValueError:
                continue
                
        consistency = int((recent_count / 14.0) * 100)
        consistency = min(100, consistency)
        
        # Predict probability of completion tomorrow (Markov style / basic decay weight)
        yesterday_str = (today - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        completed_yesterday = yesterday_str in unique_dates
        
        if completed_yesterday:
            prediction = min(95, consistency + 20)
        else:
            prediction = max(10, consistency - 10)
            
        # Recommendations
        if consistency > 80:
            rec = "Incredible streak! You've formed a solid habit loop. Maintain this pace."
        elif consistency > 50:
            rec = "You are doing well, but try to set a fixed time each day to boost consistency."
        else:
            rec = "Consistency has dropped. Try pairing this habit with an existing routine (habit stacking)."
            
        return {
            "consistency_rate": consistency,
            "predicted_completion_rate": prediction,
            "recommendation": rec
        }


class MoodAnalyzer:
    @staticmethod
    def analyze_text(entry: str) -> Tuple[str, List[str], int]:
        """Basic lexicon sentiment and emotion tagger for mood entries."""
        entry_lower = entry.lower()
        
        # Emotion keyword maps
        emotions = []
        mood_score = 5 # default neutral
        
        positive_words = ["happy", "glad", "joy", "excited", "awesome", "great", "proud", "grateful", "accomplished", "love", "productive"]
        negative_words = ["sad", "depressed", "lonely", "angry", "frustrated", "tired", "stressed", "anxious", "worried", "fear", "hate"]
        neutral_words = ["okay", "fine", "normal", "routine", "average", "busy"]
        
        pos_count = sum(1 for w in positive_words if w in entry_lower)
        neg_count = sum(1 for w in negative_words if w in entry_lower)
        
        # Sentiment assessment
        if pos_count > neg_count:
            sentiment = "Positive"
            mood_score = min(10, 6 + pos_count - neg_count)
        elif neg_count > pos_count:
            sentiment = "Negative"
            mood_score = max(1, 4 - neg_count + pos_count)
        else:
            sentiment = "Neutral"
            mood_score = 5
            
        # Tag specific emotions
        if "stress" in entry_lower or "anxious" in entry_lower or "worried" in entry_lower or "overwhelm" in entry_lower:
            emotions.append("Stressed")
        if "tired" in entry_lower or "exhausted" in entry_lower or "sleepy" in entry_lower:
            emotions.append("Fatigued")
        if "happy" in entry_lower or "joy" in entry_lower or "glad" in entry_lower or "excited" in entry_lower:
            emotions.append("Joyful")
        if "sad" in entry_lower or "depressed" in entry_lower or "lonely" in entry_lower:
            emotions.append("Melancholy")
        if "proud" in entry_lower or "accomplished" in entry_lower or "productive" in entry_lower or "work" in entry_lower:
            emotions.append("Focused")
            
        if not emotions:
            emotions.append("Calm" if sentiment == "Positive" else "Neutral")
            
        return sentiment, emotions, mood_score


class ProductivityScorer:
    @staticmethod
    def calculate_score(
        completed_tasks: int,
        total_tasks: int,
        habit_consistency: float,
        mood_score: int,
        study_hours: float,
        study_goal: float
    ) -> int:
        """Compiles completed metrics into a standardized 0-100 Productivity Index."""
        # 1. Task Completion score (Weight: 40%)
        task_subscore = 0.0
        if total_tasks > 0:
            task_subscore = (completed_tasks / total_tasks) * 100
        else:
            task_subscore = 70.0  # base neutral score if no tasks
            
        # 2. Habit score (Weight: 30%)
        habit_subscore = habit_consistency  # 0 to 100
        
        # 3. Study Hours score (Weight: 20%)
        study_subscore = 0.0
        if study_goal > 0:
            study_subscore = (study_hours / study_goal) * 100
            study_subscore = min(100.0, study_subscore)
        else:
            study_subscore = 70.0
            
        # 4. Mood factor (Weight: 10%)
        mood_subscore = mood_score * 10.0  # scale 1-10 to 10-100
        
        # Weighted aggregate
        score = (task_subscore * 0.40) + (habit_subscore * 0.30) + (study_subscore * 0.20) + (mood_subscore * 0.10)
        return int(max(0, min(100, score)))


class RecommendationEngine:
    @staticmethod
    def get_recommendations(interests: List[str], recent_performance: int) -> List[Dict[str, Any]]:
        """Filters list of learning paths and materials matching user profile."""
        # Static curated catalog of mock recommendations
        catalog = [
            {
                "title": "Machine Learning by Andrew Ng",
                "description": "The ultimate foundational course for learning ML and neural networks.",
                "resource_type": "Course",
                "url": "https://www.coursera.org/specializations/machine-learning-introduction",
                "tags": ["ml", "ai", "coding"]
            },
            {
                "title": "Designing Data-Intensive Applications",
                "description": "Learn storage engine design, distributed database consensus, and scalability.",
                "resource_type": "Book",
                "url": "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/",
                "tags": ["architecture", "scaling", "backend"]
            },
            {
                "title": "React Three Fiber: 3D Graphics Guide",
                "description": "Add stunning interactive 3D elements to web designs using React wrapper for Three.js.",
                "resource_type": "Video",
                "url": "https://threejs-journey.com/",
                "tags": ["frontend", "design", "css"]
            },
            {
                "title": "FastAPI Masterclass - Building Production Microservices",
                "description": "Explore async route handlers, task dependency injections, and scaling uvicorn workers.",
                "resource_type": "Course",
                "url": "https://fastapi.tiangolo.com/",
                "tags": ["backend", "python", "coding"]
            },
            {
                "title": "Deep Work by Cal Newport",
                "description": "How to cultivate intense focus in a world full of distractions.",
                "resource_type": "Book",
                "url": "https://www.calnewport.com/books/deep-work/",
                "tags": ["productivity", "general", "habits"]
            }
        ]
        
        # Basic matching logic
        interests_lower = [i.lower() for i in interests]
        matched = []
        
        for item in catalog:
            match_score = 0
            for tag in item["tags"]:
                if tag in interests_lower:
                    match_score += 1
            if match_score > 0 or not interests:
                matched.append(item)
                
        # If no custom interest match, show all items
        if not matched:
            matched = catalog
            
        # Customize recommendation reasoning based on performance score
        results = []
        for idx, item in enumerate(matched):
            if recent_performance < 50:
                reason = "Focus is dropping. This light content helps you ease back into your learning path."
            elif recent_performance > 85:
                reason = "Productivity score is outstanding. Dive into this challenging content to level up!"
            else:
                reason = f"Suggested because of your interest in {item['tags'][0]}."
                
            results.append({
                "title": item["title"],
                "description": item["description"],
                "resource_type": item["resource_type"],
                "url": item["url"],
                "reasoning": reason
            })
            
        return results
