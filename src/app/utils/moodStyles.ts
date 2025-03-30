interface MoodStyle {
  gradient: string;
  textColor: string;
  accentColor: string;
}

export const moodStyles: Record<string, MoodStyle> = {
  Happy: {
    gradient: 'bg-gradient-to-br from-yellow-200 via-orange-200 to-pink-200',
    textColor: 'text-orange-900',
    accentColor: 'bg-orange-500'
  },
  Sad: {
    gradient: 'bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200',
    textColor: 'text-blue-900',
    accentColor: 'bg-blue-500'
  },
  Energetic: {
    gradient: 'bg-gradient-to-br from-red-200 via-orange-200 to-yellow-200',
    textColor: 'text-red-900',
    accentColor: 'bg-red-500'
  },
  Calm: {
    gradient: 'bg-gradient-to-br from-green-200 via-teal-200 to-blue-200',
    textColor: 'text-green-900',
    accentColor: 'bg-green-500'
  },
  Anxious: {
    gradient: 'bg-gradient-to-br from-purple-200 via-pink-200 to-red-200',
    textColor: 'text-purple-900',
    accentColor: 'bg-purple-500'
  },
  Focused: {
    gradient: 'bg-gradient-to-br from-gray-200 via-slate-200 to-zinc-200',
    textColor: 'text-gray-900',
    accentColor: 'bg-gray-500'
  },
  Romantic: {
    gradient: 'bg-gradient-to-br from-pink-200 via-rose-200 to-red-200',
    textColor: 'text-pink-900',
    accentColor: 'bg-pink-500'
  },
  Nostalgic: {
    gradient: 'bg-gradient-to-br from-amber-200 via-yellow-200 to-orange-200',
    textColor: 'text-amber-900',
    accentColor: 'bg-amber-500'
  },
  Melancholic: {
    gradient: 'bg-gradient-to-br from-slate-200 via-gray-200 to-zinc-200',
    textColor: 'text-slate-900',
    accentColor: 'bg-slate-500'
  },
  Excited: {
    gradient: 'bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200',
    textColor: 'text-yellow-900',
    accentColor: 'bg-yellow-500'
  },
  Peaceful: {
    gradient: 'bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-200',
    textColor: 'text-blue-900',
    accentColor: 'bg-blue-500'
  },
  Stressed: {
    gradient: 'bg-gradient-to-br from-red-200 via-orange-200 to-yellow-200',
    textColor: 'text-red-900',
    accentColor: 'bg-red-500'
  },
  Playful: {
    gradient: 'bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200',
    textColor: 'text-pink-900',
    accentColor: 'bg-pink-500'
  },
  Reflective: {
    gradient: 'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200',
    textColor: 'text-indigo-900',
    accentColor: 'bg-indigo-500'
  },
  Motivated: {
    gradient: 'bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200',
    textColor: 'text-green-900',
    accentColor: 'bg-green-500'
  }
};

export const getMoodStyle = (mood: string): MoodStyle => {
  return moodStyles[mood] || {
    gradient: 'bg-gradient-to-br from-gray-200 via-slate-200 to-zinc-200',
    textColor: 'text-gray-900',
    accentColor: 'bg-gray-500'
  };
}; 