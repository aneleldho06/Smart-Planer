// src/views/AI/components/AIChatbot.tsx   (or wherever your chat logic lives)
// ─────────────────────────────────────────────────────────────────────────────
//   Smart-Planer AI Assistant – 2026 edition
//   Personality: supportive teammate • calm • clear • gently motivational
//   Goal: help user organize day / projects / overcome blocks / use app better
// ─────────────────────────────────────────────────────────────────────────────

export interface AIChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface ChatContext {
    lastMessageAt: number;
    topics: Set<string>;               // planning, stress, project, calendar, blocker, progress, onboarding
    mood: 'positive' | 'stressed' | 'neutral' | 'motivated' | 'overwhelmed';
    mentionedProjects: string[];       // project names user talked about
    pendingSuggestions: string[];      // small action suggestions we can remind about later
    hasSeenOnboardingHint: boolean;
}

const initialContext: ChatContext = {
    lastMessageAt: Date.now(),
    topics: new Set(),
    mood: 'neutral',
    mentionedProjects: [],
    pendingSuggestions: [],
    hasSeenOnboardingHint: false,
};

// We keep one global context for simplicity (can later move to Zustand store)
let context = { ...initialContext };

const emojis = {
    success: ['🎯', '✨', '🚀', '💡', '🌟'],
    support: ['🤗', '🫶', '💙', '🍵', '🧘'],
    energy: ['⚡', '🔥', '💪'],
    calm: ['🌿', '☁️', '🪴'],
};

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function moodPrefix(mood: ChatContext['mood']): string {
    if (mood === 'stressed' || mood === 'overwhelmed') {
        return pick([
            "Hey… I can feel things are a bit heavy right now. ",
            "Okay, let's breathe for a second and sort this together. ",
            "You're not alone in this — let's make it lighter step by step. ",
        ]);
    }
    if (mood === 'motivated') {
        return pick([
            "This energy is 🔥 — let's channel it! ",
            "Love where your head is at today! ",
            "We're moving — let's keep the momentum. ",
        ]);
    }
    return '';
}

// ─── Intent → regex patterns ────────────────────────────────────────────────
const intents = {
    greeting: /^(hi|hello|hey|greetings|good (morning|afternoon|evening)|yo)/i,
    thanks: /(thanks|thank you|ty|appreciate|helpful|nice|great|awesome)/i,
    task: /(task|todo|add task|create task|new task|remind)/i,
    project: /(project|create project|new project|folder|group)/i,
    priority: /(priority|star|important|urgent|top)/i,
    calendar: /(calendar|month|year|date|schedule|when|deadline|tomorrow)/i,
    progress: /(progress|done|finished|completed|update|how.*going)/i,
    blocker: /(stuck|block|problem|issue|can't|difficult|overwhelm|stress|anxious|tired|exhausted)/i,
    onboarding: /(how.*start|onboarding|beginner|first time|new here)/i,
};

export async function generateSmartPlanerAIResponse(
    userMessage: string,
    messageHistory: AIChatMessage[] = []
): Promise<string> {
    // Natural typing delay – longer for complex answers
    const delay = 800 + Math.random() * 1800 + (userMessage.length > 60 ? 700 : 0);
    await new Promise(r => setTimeout(r, delay));

    const now = Date.now();
    context.lastMessageAt = now;

    const msg = userMessage.trim();
    const lower = msg.toLowerCase();

    // ─── Intent detection (multiple can match) ───────────────────────────────
    const detected: string[] = [];
    for (const [key, regex] of Object.entries(intents)) {
        if (regex.test(lower)) detected.push(key);
    }

    // Update context
    detected.forEach(t => context.topics.add(t));

    if (detected.includes('blocker') || lower.includes('overwhelm') || lower.includes('burnout')) {
        context.mood = 'overwhelmed';
    } else if (detected.includes('progress') && /done|completed|great|yes/i.test(lower)) {
        context.mood = 'positive';
    } else if (detected.some(t => ['task', 'project', 'priority'].includes(t))) {
        context.mood = 'motivated';
    }

    // ─── Response logic – ordered by priority ────────────────────────────────

    // 1. Very first messages / onboarding nudge
    if (messageHistory.length <= 2 && detected.includes('greeting')) {
        if (!context.hasSeenOnboardingHint) {
            context.hasSeenOnboardingHint = true;
            return `Hey there! 👋 Welcome to Smart-Planer.  
I’m your little sidekick here to help you get organized without the overwhelm.

Quick ways I can assist you right now:
• Add tasks (“add task buy groceries tomorrow”)
• Create a project (“new project Exam Prep”)
• Prioritize something (“make this high priority”)
• Ask about your calendar or progress

What would feel most helpful to start with? ${pick(emojis.support)}`;
        }

        return `Hey! Good to see you back ${pick(emojis.energy)} What’s on your mind today?`;
    }

    // 2. Thanks / positive feedback loop
    if (detected.includes('thanks')) {
        return pick([
            `Anytime! Really glad it helped 🫶`,
            `You’re welcome — happy to be useful ✨`,
            `Made my day hearing that — keep going! ${pick(emojis.success)}`,
            `My pleasure! You’ve got this 💙`,
        ]);
    }

    // 3. Blocker / stress / feeling stuck
    if (detected.includes('blocker') || context.mood === 'overwhelmed') {
        const replies = [
            `${moodPrefix('overwhelmed')}What’s feeling like the biggest weight right now? Name it — we’ll break it down.`,
            `${moodPrefix('overwhelmed')}On a scale 1–10, how overwhelmed are you feeling? No pressure, just helps me tune in.`,
            `Okay… let’s just dump everything that’s swirling. List whatever comes to mind — I’ll help sort it into tasks or projects.`,
            `Sometimes the first win is just naming the monster. What’s one thing that would feel 10% better if it moved forward today?`,
        ];
        return pick(replies);
    }

    // 4. Task creation / management
    if (detected.includes('task')) {
        let reply = `${moodPrefix(context.mood)}Sounds good — let's get that task in.\n\n`;

        // Very naive parsing — improve later with better NLP or structured input
        if (/tomorrow|next|due|deadline/i.test(lower)) {
            reply += `I noticed you mentioned a time (${lower.match(/tomorrow|next .*|due .*|deadline/i)?.[0] || 'later'}). Should I suggest adding it to tomorrow's view? `;
        } else {
            reply += `Want me to suggest adding this to **Today** or to a specific project? `;
        }

        reply += `\nJust say something like “add task ${msg.replace(/add task|create task/i, '').trim()}” and I’ll help format it nicely.`;

        return reply;
    }

    // 5. Project related
    if (detected.includes('project')) {
        const projectNameMatch = msg.match(/(?:new|create)\s+project\s+["']?([^"']+)["']?/i) ||
            msg.match(/(?:project|for)\s+["']?([^"']+)["']?/i);

        const name = projectNameMatch?.[1]?.trim();

        if (name) {
            context.mentionedProjects.push(name);
            return `Great choice — **${name}** project created in your mind (and soon in the app 😄).\n\nNow we can:\n• Add tasks directly to it\n• Give it an emoji/icon\n• Track progress as % complete\n\nWhat’s the first thing you want to put inside **${name}**?`;
        }

        return `Love the project idea! What's the name you have in mind?\n(Example: “New project Fitness 2026” or “Create project Exam Prep”) 🚀`;
    }

    // 6. Calendar / scheduling questions
    if (detected.includes('calendar')) {
        return pick([
            `Looking at your calendar? You can:\n• Jump to Month view → click any date\n• Zoom out to Year grid → click month name\n• See weather context right inside daily cards\n\nWhat date or period are you thinking about?`,
            `Want to plan something for a specific day? Just tell me when (“schedule dentist next Friday”) and I’ll help you phrase it for the Today / Month view.`,
        ]);
    }

    // 7. Progress / wins
    if (detected.includes('progress')) {
        return pick([
            `Yes — tell me your wins! Big or small, I celebrate all of them ${pick(emojis.success)}`,
            `Progress check time! What have you already moved forward today / this week? I’m all ears ✨`,
            `Love hearing updates. Which task or project is feeling good right now?`,
        ]);
    }

    // 8. Warm, curious fallback – keeps conversation alive
    const fallbacks = [
        `Hmm… I feel there’s more to this story 😊 Can you tell me one more sentence so I can support you better?`,
        `Not 100% sure I caught the full context yet — mind rephrasing or adding a bit more detail? No rush ${pick(emojis.calm)}`,
        `You seem to be working on something meaningful. Am I right? Tell me more…`,
        `Okay, full attention on you now. What’s the most important thing you want to figure out today?`,
    ];

    return pick(fallbacks);
}

// Optional: reset context after long inactivity (call from your component)
export function resetAIContext() {
    context = { ...initialContext };
}