import React, { useState, useEffect } from 'react';
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

  const handleMissionBlur = () => {
    if (!missionSaved) {
      setMissionStatement(mission);
      setMissionSaved(true);
    }
  };

  const openAddValue = () => {
    setEditingValue(null);
    setValueForm({ name: '', description: '' });
    setShowValueModal(true);
  };

  const openEditValue = (value: Value) => {
    setEditingValue(value);
    setValueForm({ name: value.name, description: value.description });
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

  const sortedValues = [...values].sort((a, b) => a.order - b.order);

  // Simple drag-and-drop reorder
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;
    const newValues = [...sortedValues];
    const [moved] = newValues.splice(dragIdx, 1);
    newValues.splice(targetIdx, 0, moved);
    reorderValues(newValues.map((v, i) => ({ ...v, order: i })));
    setDragIdx(targetIdx);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Mission & Values</h1>
        <p className="text-sm text-gray-400 mt-1">The foundation of 4th Generation planning — know who you are and what matters most</p>
      </div>

      {/* Mission Statement */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#1e3a5f] to-[#2a4f80]">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-[#d4a017]" />
            <h2 className="font-semibold text-white">Personal Mission Statement</h2>
          </div>
          <div className="flex items-center gap-2">
            {!missionSaved && (
              <span className="text-xs text-amber-300">Unsaved</span>
            )}
            <button
              onClick={handleSaveMission}
              disabled={missionSaved}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                missionSaved
                  ? 'text-white/30 cursor-default'
                  : 'bg-[#d4a017] text-white hover:bg-[#b8880f]'
              }`}
            >
              <Save size={12} /> Save
            </button>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-500 mb-3 italic">
            "A personal mission statement becomes a personal constitution — the basis for making major, life-directing decisions." — Stephen Covey
          </p>
          <textarea
            value={mission}
            onChange={e => handleMissionChange(e.target.value)}
            onBlur={handleMissionBlur}
            rows={10}
            placeholder="Write your personal mission statement here. Consider: What are my most important values? What kind of person do I want to be? What do I want to accomplish? What impact do I want to have?"
            className="w-full text-sm text-gray-700 border border-gray-100 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 bg-[#faf8f3] resize-none leading-relaxed"
          />
          <p className="text-xs text-gray-300 mt-1.5">Auto-saves on blur, or click Save above.</p>
        </div>
      </div>

      {/* Governing Values */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-[#1e3a5f]">Governing Values</h2>
            <p className="text-xs text-gray-400 mt-0.5">The principles that guide your decisions and actions</p>
          </div>
          <Button size="sm" onClick={openAddValue}>
            <Plus size={14} /> Add Value
          </Button>
        </div>

        {sortedValues.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="mb-3 text-sm">No governing values defined yet.</p>
            <Button variant="secondary" size="sm" onClick={openAddValue}>
              <Plus size={14} /> Add your first value
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sortedValues.map((value, idx) => (
              <div
                key={value.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-start gap-3 px-5 py-4 group hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing ${
                  dragIdx === idx ? 'opacity-50 bg-blue-50' : ''
                }`}
              >
                <div className="shrink-0 mt-1 text-gray-300 group-hover:text-gray-400">
                  <GripVertical size={16} />
                </div>
                <div
                  className="shrink-0 w-7 h-7 rounded-full bg-[#d4a017] flex items-center justify-center text-white text-xs font-bold"
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800">{value.name}</div>
                  {value.description && (
                    <div className="text-sm text-gray-500 mt-0.5">{value.description}</div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openEditValue(value)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteValue(value.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guiding Tips */}
      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-5">
        <h3 className="font-semibold text-amber-900 mb-2 text-sm">Franklin Covey Guidance</h3>
        <ul className="text-sm text-amber-800 space-y-1.5 list-disc list-inside">
          <li>Your mission statement is your personal constitution — revisit and refine it regularly</li>
          <li>Governing values should reflect what truly matters, not what sounds good</li>
          <li>Weekly planning begins by reviewing your roles and asking: what Big Rocks should I schedule this week?</li>
          <li>Daily planning starts by asking: what A-priority tasks move me toward my goals?</li>
        </ul>
      </div>

      {/* Value Modal */}
      <Modal isOpen={showValueModal} onClose={() => setShowValueModal(false)} title={editingValue ? 'Edit Value' : 'Add Governing Value'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value Name *</label>
            <input
              type="text"
              value={valueForm.name}
              onChange={e => setValueForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSaveValue()}
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              placeholder="e.g., Integrity, Family, Growth"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={valueForm.description}
              onChange={e => setValueForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
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
