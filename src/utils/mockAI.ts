export interface AIChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
}

const mockResponses = [
    "That sounds like a solid plan! Breaking it down into smaller steps usually helps. Have you verified the prerequisites?",
    "I can help you organize that. When is your deadline?",
    "Remember to take breaks. Focused work blocks of 25-50 minutes work wonders.",
    "Do you want me to suggest a timeline for this?",
    "Great goal! Let's prioritize the most critical task first.",
    "Don't worry about perfection right now. Just getting started is the biggest step.",
    "I'm here to support you. What's the biggest blocker you're facing?",
    "That looks achievable. Want to add it to your tasks for Today?",
    "How are you feeling about your workload today?",
    "Let's simplify this. What is the one thing that MUST happen today?",
];

export const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1000));

    // simple keyword matching or random fallback
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes('plan') || lowerMsg.includes('schedule')) {
        return "I can help you plan your day. Based on your tasks, I'd suggest tackling the hardest one first thing in the morning. Does that work for you?";
    }

    if (lowerMsg.includes('stress') || lowerMsg.includes('tired') || lowerMsg.includes('hard')) {
        return "It's okay to feel that way. Take a deep breath. Maybe a short walk or a glass of water would help reset? You've got this.";
    }

    if (lowerMsg.includes('goal')) {
        return "Setting goals is powerful. Let's break that goal down into 3 actionable steps for this week.";
    }

    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
};
