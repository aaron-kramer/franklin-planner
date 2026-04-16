import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { usePlannerStore } from '../../store/plannerStore';

interface DailyNotesProps {
  date: string;
}

export function DailyNotes({ date }: DailyNotesProps) {
  const { dailyNotes, setDailyNote } = usePlannerStore();
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const note = dailyNotes.find(n => n.date === date);
    setContent(note?.content || '');
    setSaved(true);
  }, [date, dailyNotes]);

  const handleChange = (val: string) => {
    setContent(val);
    setSaved(false);
  };

  const handleSave = () => {
    setDailyNote(date, content);
    setSaved(true);
  };

  // Auto-save on blur
  const handleBlur = () => {
    if (!saved) {
      setDailyNote(date, content);
      setSaved(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-[#1e3a5f]">Daily Notes</h2>
        <div className="flex items-center gap-2">
          {!saved && (
            <span className="text-xs text-amber-500">Unsaved</span>
          )}
          {saved && content && (
            <span className="text-xs text-green-500">Saved</span>
          )}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              saved
                ? 'text-gray-300 cursor-default'
                : 'text-[#1e3a5f] bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20'
            }`}
            disabled={saved}
          >
            <Save size={12} /> Save
          </button>
        </div>
      </div>
      <div className="p-4">
        <textarea
          value={content}
          onChange={e => handleChange(e.target.value)}
          onBlur={handleBlur}
          rows={8}
          placeholder="Capture thoughts, insights, follow-ups, and ideas for today…"
          className="w-full text-sm text-gray-700 border border-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 bg-[#faf8f3] resize-none leading-relaxed"
        />
        <p className="text-xs text-gray-300 mt-1">Notes auto-save on blur, or press Save above.</p>
      </div>
    </div>
  );
}
