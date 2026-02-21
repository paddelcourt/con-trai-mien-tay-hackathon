export interface GameRound {
  id: number;
  actualPrompt: string;
  aiResponse: string;
  hints?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const gameRounds: GameRound[] = [
  {
    id: 1,
    actualPrompt: "Write a haiku about programming",
    aiResponse: "Syntax errors fall\nLike autumn leaves in the wind\nDebugger reveals",
    difficulty: 'easy',
    hints: ["It's about poetry", "Three lines"]
  },
  {
    id: 2,
    actualPrompt: "Explain quantum computing to a 5 year old",
    aiResponse: "Imagine you have a magic coin that can be both heads AND tails at the same time until you look at it! Regular computers use coins that are only heads or tails. But quantum computers use these magic coins that can be both. This lets them solve really hard puzzles super fast, like finding your favorite toy in a room full of millions of toys!",
    difficulty: 'easy',
    hints: ["Teaching concept", "Simple explanation"]
  },
  {
    id: 3,
    actualPrompt: "Write a passive aggressive email about someone stealing your lunch from the office fridge",
    aiResponse: "Subject: Regarding the Mystery of the Disappearing Lunch\n\nHi Team,\n\nI hope everyone enjoyed their lunch today! I certainly didn't get to enjoy mine, as it seems to have grown legs and walked away from the refrigerator. My clearly labeled container (the one with my name written on it THREE times) has apparently found a new home.\n\nTo whoever adopted my chicken salad: I hope it brought you joy. I'll just be here at my desk, eating vending machine crackers and contemplating the nature of trust in our workplace.\n\nWarmest regards,\n[Name]",
    difficulty: 'medium',
    hints: ["Workplace situation", "Sarcastic tone"]
  },
  {
    id: 4,
    actualPrompt: "What would happen if gravity suddenly became 10x stronger?",
    aiResponse: "If gravity suddenly increased tenfold, the consequences would be catastrophic:\n\n**Immediate Effects:**\n- Humans would collapse under their own weight (effectively weighing 700-2000 lbs)\n- Buildings would crumble as structural supports fail\n- Aircraft would plummet from the sky\n- Trees would snap and fall\n\n**Within Minutes:**\n- The atmosphere would compress dramatically, increasing air pressure\n- Blood flow would struggle against the increased force\n- Most land animals would suffocate or suffer cardiac failure\n\n**Geological:**\n- Mountains would begin flattening\n- Earthquakes would trigger worldwide\n- The Earth itself would compress, releasing tremendous heat\n\n**Long-term:**\n- The moon would spiral closer and eventually collide\n- Oceans would redistribute toward the equator\n- Only microscopic life might survive",
    difficulty: 'medium',
    hints: ["Hypothetical scenario", "Physics related"]
  },
  {
    id: 5,
    actualPrompt: "Write a recipe for disaster",
    aiResponse: "**Recipe for Disaster**\n*Serves: Everyone you know*\n*Prep time: Years of poor decisions*\n\n**Ingredients:**\n- 2 cups of procrastination\n- 1 tablespoon of ignored red flags\n- A generous handful of overconfidence\n- 3 missed deadlines, finely chopped\n- 1 expired backup plan\n- A pinch of \"it'll probably be fine\"\n\n**Instructions:**\n1. Begin by ignoring all warning signs until fully incorporated into your routine.\n2. Add procrastination slowly, letting it simmer on low heat for months.\n3. When pressure builds, fold in overconfidence until nothing can possibly go wrong.\n4. Let it all come to a boil on the day everything is due.\n5. Serve immediately to maximum number of people.\n\n**Chef's Note:** Best enjoyed with a side of regret and hindsight.",
    difficulty: 'medium',
    hints: ["Creative/humor", "Format is important"]
  },
  {
    id: 6,
    actualPrompt: "Convince me that birds aren't real",
    aiResponse: "Look, I'm not saying birds aren't real, but consider this:\n\n**Suspicious Evidence:**\n1. **Perfect surveillance placement** - Birds sit on power lines. What else sits on power lines? Cameras. Coincidence?\n\n2. **Battery charging** - Ever seen birds sitting on power lines? They're *charging*. Birds \"migrating south\"? That's just scheduled maintenance.\n\n3. **No baby pigeons** - Have you EVER seen a baby pigeon? I rest my case.\n\n4. **The Kennedy connection** - The CIA invented birds in 1956 to replace real birds killed by pesticides. The \"Birds Aren't Real\" movement knows the truth.\n\n5. **Bird behavior** - Why do birds suddenly appear every time you are near? SURVEILLANCE.\n\n*This message was brought to you by the Birds Aren't Real movement. For entertainment purposes only. Please do not actually believe birds aren't real.*",
    difficulty: 'hard',
    hints: ["Conspiracy/humor", "Persuasive writing"]
  },
  {
    id: 7,
    actualPrompt: "Write code that looks like it works but doesn't",
    aiResponse: "```javascript\nfunction isEven(num) {\n  // Convert to string to check each digit\n  const str = num.toString();\n  \n  // Check if the last digit is even\n  const lastDigit = str[str.length - 1];\n  const evenDigits = ['0', '2', '4', '6', '8'];\n  \n  // This looks right...\n  return evenDigits.includes(lastDigit);\n}\n\n// Works for: 2, 4, 10, 24\n// Fails for: -2, 3.14, \"hello\"\n\nfunction sleep(ms) {\n  const start = Date.now();\n  while (Date.now() - start < ms);\n  // Looks like it works, but blocks the event loop!\n}\n\nfunction deepCopy(obj) {\n  return JSON.parse(JSON.stringify(obj));\n  // Fails with: functions, undefined, circular refs, Dates, Maps, Sets...\n}\n```",
    difficulty: 'hard',
    hints: ["Programming", "Deceptive"]
  },
  {
    id: 8,
    actualPrompt: "Tell me a bedtime story but make it unsettling",
    aiResponse: "Once upon a time, in a cozy little house at the end of a quiet street, there lived a girl named Emma.\n\nEvery night, Emma's mother would tuck her in, kiss her forehead, and say, \"Goodnight, sweetheart. Don't let the bedbugs bite.\"\n\nOne night, after her mother left, Emma heard a tiny voice from under her bed: \"We never bite. We just watch.\"\n\nEmma pulled the covers up tight. \"Who's there?\"\n\n\"We've always been here,\" the voice replied. \"We were here before the house. We'll be here after.\"\n\nEmma squeezed her eyes shut. When she opened them, morning light streamed through her window. She laughed at her silly imagination.\n\nBut as she climbed out of bed, she noticed something odd about her childhood drawings on the wall.\n\nIn every single one, she had drawn herself with a shadow.\n\nBut the shadow had too many eyes.\n\n*Sleep tight.*",
    difficulty: 'hard',
    hints: ["Creative writing", "Mix of genres"]
  }
];

export function calculateScore(guess: string, actual: string): number {
  const guessLower = guess.toLowerCase().trim();
  const actualLower = actual.toLowerCase().trim();

  // Exact match
  if (guessLower === actualLower) return 100;

  // Check for key word matches
  const actualWords = actualLower.split(/\s+/);
  const guessWords = guessLower.split(/\s+/);

  let matchedWords = 0;
  for (const word of guessWords) {
    if (word.length > 3 && actualWords.some(w => w.includes(word) || word.includes(w))) {
      matchedWords++;
    }
  }

  const wordScore = (matchedWords / actualWords.length) * 60;

  // Check for concept similarity (simple version)
  const conceptBonus = actualLower.includes(guessLower.substring(0, 10)) ? 20 : 0;

  return Math.min(Math.round(wordScore + conceptBonus), 95);
}

export function getScoreMessage(score: number): string {
  if (score >= 90) return "Incredible! You're a mind reader!";
  if (score >= 70) return "So close! Great intuition!";
  if (score >= 50) return "You're on the right track!";
  if (score >= 30) return "Some good ideas there!";
  return "Nice try! The answer might surprise you.";
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--error)';
}
