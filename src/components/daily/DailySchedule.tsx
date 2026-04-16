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

  // Get appointments that start at or overlap a time slot
  const getAppointmentsForSlot = (time: string): Appointment[] => {
    return dayAppointments.filter(a => a.startTime === time);
  };

  const getRoleColor = (roleId?: string) => {
    if (!roleId) return '#1e3a5f';
    return roles.find(r => r.id === roleId)?.color || '#1e3a5f';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-[#1e3a5f]">Daily Schedule</h2>
        <Button size="sm" onClick={() => openAdd()}>
          <Plus size={14} /> Add Appointment
        </Button>
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        {timeSlots.map(slot => {
          const slotAppts = getAppointmentsForSlot(slot);
          const isHour = slot.endsWith(':00');
          return (
            <div
              key={slot}
              className={`flex group ${isHour ? 'border-t border-gray-100' : 'border-t border-gray-50'}`}
            >
              {/* Time label */}
              <div className={`w-16 shrink-0 px-3 py-1.5 text-right ${isHour ? 'text-xs font-medium text-gray-500' : 'text-xs text-gray-300'}`}>
                {isHour ? formatTime(slot) : ''}
              </div>

              {/* Slot content */}
              <div className="flex-1 min-h-[32px] relative border-l border-gray-100 px-2 py-1">
                {slotAppts.map(appt => {
                  const color = getRoleColor(appt.roleId);
                  return (
                    <div
                      key={appt.id}
                      onClick={() => openEdit(appt)}
                      className="flex items-start gap-2 px-2 py-1.5 rounded-lg mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: `${color}15`, borderLeft: `3px solid ${color}` }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium" style={{ color }}>
                          {appt.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                          {appt.location && ` · ${appt.location}`}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteAppointment(appt.id); }}
                        className="shrink-0 p-0.5 rounded hover:bg-red-100 text-gray-300 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}

                {slotAppts.length === 0 && (
                  <button
                    onClick={() => openAdd(slot)}
                    className="absolute inset-0 w-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              placeholder="Appointment title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <select
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
              >
                {getTimeSlots().map(t => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <select
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
              >
                {getTimeSlots().map(t => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role (optional)</label>
            <select
              value={form.roleId}
              onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
            >
              <option value="">— No specific role —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin size={14} className="inline mr-1" />Location (optional)
            </label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              placeholder="Meeting room, address…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
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
