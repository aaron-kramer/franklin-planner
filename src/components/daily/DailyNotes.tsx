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

  const handleBlur = () => {
    if (!saved) {
      setDailyNote(date, content);
      setSaved(true);
    }
  };

  return (
    <div className="bg-[#1a1210] rounded-xl border border-[#3a2010] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3a2010]">
        <h2 className="font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide text-sm">Daily Chronicle</h2>
        <div className="flex items-center gap-2">
          {!saved && (
            <span className="text-xs text-[#c05808]">Unsaved</span>
          )}
          {saved && content && (
            <span className="text-xs text-[#4aaa60]">Saved</span>
          )}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              saved
                ? 'text-[#3a2010] cursor-default'
                : 'text-[#c05808] bg-[#8b1515]/10 hover:bg-[#8b1515]/20'
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
          placeholder="Inscribe your thoughts, insights, and wisdom here…"
          className="w-full text-sm text-[#c8aa78] border border-[#3a2010] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#8b1515]/30 bg-[#140e0a] placeholder-[#3a2010] resize-none leading-relaxed"
        />
        <p className="text-xs text-[#3a2010] mt-1">Notes auto-save on blur.</p>
      </div>
    </div>
  );
}
