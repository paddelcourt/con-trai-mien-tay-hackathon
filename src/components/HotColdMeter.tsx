'use client';

interface HotColdMeterProps {
  score: number;
  feedback: string;
  isNew?: boolean;
}

function getTemperatureLabel(score: number): { label: string; emoji: string; color: string } {
  if (score >= 96) return { label: 'BOILING!', emoji: '🔥🔥🔥', color: 'text-yellow-300' };
  if (score >= 81) return { label: 'VERY HOT!', emoji: '🔥🔥', color: 'text-red-400' };
  if (score >= 61) return { label: 'HOT!', emoji: '🔥', color: 'text-orange-400' };
  if (score >= 41) return { label: 'WARM', emoji: '🌡️', color: 'text-yellow-400' };
  if (score >= 21) return { label: 'COLD', emoji: '🧊', color: 'text-cyan-400' };
  return { label: 'FREEZING', emoji: '❄️', color: 'text-blue-400' };
}

function getBarColor(score: number): string {
  if (score >= 96) return 'from-orange-500 to-yellow-400';
  if (score >= 81) return 'from-red-600 to-red-400';
  if (score >= 61) return 'from-orange-600 to-orange-400';
  if (score >= 41) return 'from-yellow-600 to-yellow-400';
  if (score >= 21) return 'from-cyan-700 to-cyan-500';
  return 'from-blue-800 to-blue-600';
}

export default function HotColdMeter({ score, feedback, isNew }: HotColdMeterProps) {
  const { label, emoji, color } = getTemperatureLabel(score);
  const barColor = getBarColor(score);
  const isVeryHot = score >= 81;

  return (
    <div className={`mt-2 ${isNew ? 'animate-score-flash' : ''}`}>
      {/* Bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Score + Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${color} ${isVeryHot ? 'animate-hot-pulse' : ''}`}>
            {emoji} {label}
          </span>
          <span className="text-xs text-white/40">{feedback}</span>
        </div>
        <span className={`text-sm font-mono font-bold ${color}`}>{score}%</span>
      </div>
    </div>
  );
}
