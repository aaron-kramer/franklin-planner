import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, GripVertical, Save, Heart } from 'lucide-react';
import { usePlannerStore } from '../../store/plannerStore';
import type { Value } from '../../types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

export function MissionValues() {
  const { missionStatement, values, setMissionStatement, addValue, updateValue, deleteValue, reorderValues } = usePlannerStore();

  const [mission, setMission] = useState(missionStatement);
  const [missionSaved, setMissionSaved] = useState(true);
  const [showValueModal, setShowValueModal] = useState(false);
  const [editingValue, setEditingValue] = useState<Value | null>(null);
  const [valueForm, setValueForm] = useState({ name: '', description: '' });
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    setMission(missionStatement);
    setMissionSaved(true);
  }, [missionStatement]);

  const handleMissionChange = (val: string) => {
    setMission(val);
    setMissionSaved(false);
  };

  const handleSaveMission = () => {
    setMissionStatement(mission);
    setMissionSaved(true);
  };

  const sortedValues = [...values].sort((a, b) => a.order - b.order);

  const openAddValue = () => {
    setEditingValue(null);
    setValueForm({ name: '', description: '' });
    setShowValueModal(true);
  };

  const openEditValue = (v: Value) => {
    setEditingValue(v);
    setValueForm({ name: v.name, description: v.description });
    setShowValueModal(true);
  };

  const handleSaveValue = () => {
    if (!valueForm.name.trim()) return;
    if (editingValue) {
      updateValue(editingValue.id, { name: valueForm.name.trim(), description: valueForm.description });
    } else {
      addValue({ name: valueForm.name.trim(), description: valueForm.description });
    }
    setShowValueModal(false);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDrop = (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    const newOrder = [...sortedValues];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    reorderValues(newOrder.map((v, i) => ({ ...v, order: i })));
    setDragIdx(null);
  };

  const inputClass = "w-full border border-[#5a2a18] rounded-lg px-3 py-2 text-sm bg-[#140e0a] text-[#e8d4a0] placeholder-[#3a2010] focus:outline-none focus:ring-2 focus:ring-[#8b1515]/40";

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#e8d4a0]">Mission & Values</h1>
        <p className="hidden sm:block text-xs text-[#6a4828] mt-1 font-['Cinzel',serif] tracking-wide">Your compass — the foundation of all decisions</p>
      </div>

      <div className="rune-divider mb-4 md:mb-6" />

      {/* Mission Statement */}
      <div className="bg-[#1a1210] rounded-xl border border-[#3a2010] overflow-hidden mb-6" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
        <div
          className="px-5 py-4 border-b border-[#3a2010] flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1a0808 0%, #2a1010 100%)' }}
        >
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-[#8b1515]" style={{ filter: 'drop-shadow(0 0 4px #8b1515)' }} />
            <h2 className="font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide text-sm">Personal Mission Statement</h2>
          </div>
          <div className="flex items-center gap-2">
            {!missionSaved && <span className="text-xs text-[#c05808]">Unsaved</span>}
            {missionSaved && mission && <span className="text-xs text-[#4aaa60]">Saved</span>}
            <button
              onClick={handleSaveMission}
              disabled={missionSaved}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                missionSaved ? 'text-[#3a2010] cursor-default' : 'text-[#c05808] bg-[#8b1515]/10 hover:bg-[#8b1515]/20'
              }`}
            >
              <Save size={12} /> Save
            </button>
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs text-[#6a4828] mb-3 italic font-['Cinzel',serif]">
            "What do I want to be and do? What are my values? What is my vision?"
          </p>
          <textarea
            value={mission}
            onChange={e => handleMissionChange(e.target.value)}
            onBlur={() => { if (!missionSaved) handleSaveMission(); }}
            rows={6}
            placeholder="Inscribe your personal mission here…"
            className="w-full text-sm text-[#c8aa78] border border-[#3a2010] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#8b1515]/30 bg-[#140e0a] placeholder-[#3a2010] resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Governing Values */}
      <div className="bg-[#1a1210] rounded-xl border border-[#3a2010] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3a2010]">
          <div>
            <h2 className="font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide text-sm">Governing Values</h2>
            <p className="text-xs text-[#4a3020] mt-0.5">The principles that guide your every decision</p>
          </div>
          <Button size="sm" onClick={openAddValue}>
            <Plus size={14} /> Add Value
          </Button>
        </div>

        {sortedValues.length === 0 ? (
          <div className="p-8 text-center text-[#3a2010] italic">
            <p className="mb-3">No governing values defined yet.</p>
            <Button variant="secondary" size="sm" onClick={openAddValue}>
              <Plus size={14} /> Add your first value
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#2a1808]">
            {sortedValues.map((value, idx) => (
              <div
                key={value.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                className={`flex items-start gap-3 px-5 py-4 hover:bg-[#221810] group transition-colors cursor-grab active:cursor-grabbing ${
                  dragIdx === idx ? 'opacity-50' : ''
                }`}
              >
                <div className="shrink-0 mt-0.5 cursor-grab">
                  <GripVertical size={16} className="text-[#3a2010] group-hover:text-[#6a4828]" />
                </div>

                <div
                  className="shrink-0 w-7 h-7 rounded-full bg-[#8b1515]/20 border border-[#8b1515]/40 flex items-center justify-center text-xs font-bold text-[#c05808] font-['Cinzel',serif] mt-0.5"
                  style={{ boxShadow: '0 0 4px rgba(139,21,21,0.2)' }}
                >
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide">{value.name}</div>
                  {value.description && (
                    <div className="text-sm text-[#8a6848] mt-0.5">{value.description}</div>
                  )}
                </div>

                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openEditValue(value)}
                    className="p-1.5 rounded hover:bg-[#3a2010] text-[#3a2010] hover:text-[#c8aa78]"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteValue(value.id)}
                    className="p-1.5 rounded hover:bg-[#1a0808] text-[#3a2010] hover:text-[#c02020]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Value Modal */}
      <Modal
        isOpen={showValueModal}
        onClose={() => setShowValueModal(false)}
        title={editingValue ? 'Edit Value' : 'Add Governing Value'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Value Name *</label>
            <input
              type="text"
              value={valueForm.name}
              onChange={e => setValueForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSaveValue()}
              autoFocus
              className={inputClass}
              placeholder="e.g., Integrity, Courage, Wisdom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Description</label>
            <textarea
              value={valueForm.description}
              onChange={e => setValueForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className={inputClass}
              placeholder="What does this value mean to you?"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowValueModal(false)}>Cancel</Button>
            <Button onClick={handleSaveValue} disabled={!valueForm.name.trim()}>
              {editingValue ? 'Save Changes' : 'Add Value'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
