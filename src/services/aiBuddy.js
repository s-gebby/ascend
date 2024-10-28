import { readGoals, getCompletedGoals } from '../utils/database';
import openai from './openai';

class AIAccountabilityBuddy {
  constructor(userId) {
    this.userId = userId;
    this.lastCheckIn = null;
  }

  async analyzeProgress() {
    const activeGoals = await readGoals(this.userId);
    const completedGoals = await getCompletedGoals(this.userId);
    
    return this.generateProgressInsights(activeGoals, completedGoals);
  }

  async getAIResponse(prompt) {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a motivational AI accountability partner focused on helping users achieve their goals." },
                { role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
  }

  async provideFeedback() {
    const analysis = await this.analyzeProgress();
    const prompt = `Based on this goal progress: ${JSON.stringify(analysis)}, provide motivational feedback and suggestions for improvement.`;
    
    return this.getAIResponse(prompt);
  }

  generateProgressInsights(activeGoals, completedGoals) {
    const insights = {
      totalActive: Object.keys(activeGoals || {}).length,
      totalCompleted: Object.keys(completedGoals || {}).length,
      recentProgress: [],
      needsAttention: []
    };

    // Analyze active goals
    Object.entries(activeGoals || {}).forEach(([id, goal]) => {
      if (!goal.lastUpdated) {
        insights.needsAttention.push(goal);
      }
    });

    return insights;
  }

  async getDailyCheckIn() {
    const today = new Date().toDateString();
    if (this.lastCheckIn !== today) {
      this.lastCheckIn = today;
      const feedback = await this.provideFeedback();
      return {
        greeting: this.getTimeBasedGreeting(),
        message: feedback
      };
    }
    return null;
  }

  getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 17) return "Good afternoon!";
    return "Good evening!";
  }
}
export default AIAccountabilityBuddy;