import { useState } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { usePlannerStore } from '../../store/plannerStore';
import { getTimeSlots, formatTime } from '../../utils/dateUtils';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import type { Appointment } from '../../types';

interface DailyScheduleProps {
  date: string;
}

export function DailySchedule({ date }: DailyScheduleProps) {
  const { appointments, roles, addAppointment, updateAppointment, deleteAppointment } = usePlannerStore();
  const [showModal, setShowModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);

  const [form, setForm] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    roleId: '',
    location: '',
    notes: '',
  });

  const timeSlots = getTimeSlots();
  const dayAppointments = appointments.filter(a => a.date === date);

  const openAdd = (time?: string) => {
    setEditingAppt(null);
    const start = time || '09:00';
    const [h, m] = start.split(':').map(Number);
    const endH = m === 30 ? h + 1 : h;
    const endM = m === 30 ? '00' : '30';
    const end = `${endH.toString().padStart(2, '0')}:${endM}`;
    setForm({ title: '', startTime: start, endTime: end, roleId: '', location: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (appt: Appointment) => {
    setEditingAppt(appt);
    setForm({
      title: appt.title,
      startTime: appt.startTime,
      endTime: appt.endTime,
      roleId: appt.roleId || '',
      location: appt.location || '',
      notes: appt.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingAppt) {
      updateAppointment(editingAppt.id, {
        title: form.title.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        roleId: form.roleId || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });
    } else {
      addAppointment({
        title: form.title.trim(),
        date,
        startTime: form.startTime,
        endTime: form.endTime,
        roleId: form.roleId || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });
    }
    setShowModal(false);
  };

  const getAppointmentsForSlot = (time: string): Appointment[] => {
    return dayAppointments.filter(a => a.startTime === time);
  };

  const getRoleColor = (roleId?: string) => {
    if (!roleId) return '#8b1515';
    return roles.find(r => r.id === roleId)?.color || '#8b1515';
  };

  const inputClass = "w-full border border-[#5a2a18] rounded-lg px-3 py-2 text-sm bg-[#140e0a] text-[#e8d4a0] placeholder-[#3a2010] focus:outline-none focus:ring-2 focus:ring-[#8b1515]/40";

  return (
    <div className="bg-[#1a1210] rounded-xl border border-[#3a2010] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3a2010]">
        <h2 className="font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide text-sm">Daily Schedule</h2>
        <Button size="sm" onClick={() => openAdd()}>
          <Plus size={14} /> Add
        </Button>
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        {timeSlots.map(slot => {
          const slotAppts = getAppointmentsForSlot(slot);
          const isHour = slot.endsWith(':00');
          return (
            <div
              key={slot}
              className={`flex group ${isHour ? 'border-t border-[#2a1808]' : 'border-t border-[#1e1208]'}`}
            >
              {/* Time label */}
              <div className={`w-16 shrink-0 px-3 py-1.5 text-right ${isHour ? 'text-xs font-medium text-[#6a4828]' : 'text-xs text-[#3a2010]'}`}>
                {isHour ? formatTime(slot) : ''}
              </div>

              {/* Slot content */}
              <div className="flex-1 min-h-[32px] relative border-l border-[#2a1808] px-2 py-1">
                {slotAppts.map(appt => {
                  const color = getRoleColor(appt.roleId);
                  return (
                    <div
                      key={appt.id}
                      onClick={() => openEdit(appt)}
                      className="flex items-start gap-2 px-2 py-1.5 rounded-lg mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: `${color}18`,
                        borderLeft: `3px solid ${color}`,
                        boxShadow: `0 0 4px ${color}20`,
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium" style={{ color }}>
                          {appt.title}
                        </div>
                        <div className="text-xs text-[#6a4828]">
                          {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                          {appt.location && ` · ${appt.location}`}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteAppointment(appt.id); }}
                        className="shrink-0 p-0.5 rounded hover:bg-[#1a0808] text-[#3a2010] hover:text-[#c02020]"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}

                {slotAppts.length === 0 && (
                  <button
                    onClick={() => openAdd(slot)}
                    className="absolute inset-0 w-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-[#3a2010] hover:text-[#6a4828] hover:bg-[#1e1208] transition-all"
                  >
                    <Plus size={12} className="mr-1" /> {formatTime(slot)}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAppt ? 'Edit Appointment' : 'Add Appointment'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
              className={inputClass}
              placeholder="Appointment title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Start</label>
              <select
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className={inputClass + ' bg-[#140e0a]'}
              >
                {getTimeSlots().map(t => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">End</label>
              <select
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className={inputClass + ' bg-[#140e0a]'}
              >
                {getTimeSlots().map(t => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Role (optional)</label>
            <select
              value={form.roleId}
              onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}
              className={inputClass + ' bg-[#140e0a]'}
            >
              <option value="">— No specific role —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">
              <MapPin size={14} className="inline mr-1" />Location (optional)
            </label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className={inputClass}
              placeholder="Location…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              {editingAppt ? 'Save Changes' : 'Add Appointment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
