import { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { usePlannerStore } from '../../store/plannerStore';
import type { Role, Goal } from '../../types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { format } from 'date-fns';

const ROLE_COLORS = [
  '#8b1515', '#c05808', '#2a6a30', '#1a4a8a',
  '#6a2a8a', '#8a6a10', '#2a6a6a', '#5a3a10',
];

export function RolesGoals() {
  const { roles, goals, addRole, updateRole, deleteRole, addGoal, updateGoal, deleteGoal } = usePlannerStore();
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(roles.map(r => r.id)));
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [roleForm, setRoleForm] = useState({ name: '', purpose: '', color: ROLE_COLORS[0] });
  const [goalForm, setGoalForm] = useState({ title: '', description: '', targetDate: '', roleId: '' });

  const sortedRoles = [...roles].sort((a, b) => a.order - b.order);

  const toggleRole = (id: string) => {
    setExpandedRoles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', purpose: '', color: ROLE_COLORS[0] });
    setShowRoleModal(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, purpose: role.purpose, color: role.color });
    setShowRoleModal(true);
  };

  const handleSaveRole = () => {
    if (!roleForm.name.trim()) return;
    if (editingRole) {
      updateRole(editingRole.id, { name: roleForm.name.trim(), purpose: roleForm.purpose, color: roleForm.color });
    } else {
      addRole({ name: roleForm.name.trim(), purpose: roleForm.purpose, color: roleForm.color });
    }
    setShowRoleModal(false);
  };

  const openAddGoal = (roleId: string) => {
    setEditingGoal(null);
    setGoalForm({ title: '', description: '', targetDate: '', roleId });
    setShowGoalModal(true);
  };

  const openEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate || '',
      roleId: goal.roleId,
    });
    setShowGoalModal(true);
  };

  const handleSaveGoal = () => {
    if (!goalForm.title.trim()) return;
    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: goalForm.title.trim(),
        description: goalForm.description,
        targetDate: goalForm.targetDate || undefined,
        roleId: goalForm.roleId,
      });
    } else {
      addGoal({
        title: goalForm.title.trim(),
        description: goalForm.description,
        targetDate: goalForm.targetDate || undefined,
        roleId: goalForm.roleId,
        completed: false,
      });
    }
    setShowGoalModal(false);
  };

  const inputClass = "w-full border border-[#5a2a18] rounded-lg px-3 py-2 text-sm bg-[#140e0a] text-[#e8d4a0] placeholder-[#3a2010] focus:outline-none focus:ring-2 focus:ring-[#8b1515]/40";

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#e8d4a0]">Roles & Goals</h1>
          <p className="hidden sm:block text-xs text-[#6a4828] mt-1 font-['Cinzel',serif] tracking-wide">Define your key life roles and the quests within each</p>
        </div>
        <Button onClick={openAddRole}>
          <Plus size={14} /> Add Role
        </Button>
      </div>

      <div className="rune-divider mb-4 md:mb-6" />

      {roles.length === 0 ? (
        <div className="bg-[#1a1210] rounded-xl border border-[#3a2010] p-12 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
          <p className="text-[#4a3020] mb-4 italic">No roles defined yet. The Franklin Planner recommends 6–7 key life roles.</p>
          <Button onClick={openAddRole}><Plus size={14} /> Add your first role</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRoles.map(role => {
            const roleGoals = goals.filter(g => g.roleId === role.id);
            const completedGoals = roleGoals.filter(g => g.completed);
            const isExpanded = expandedRoles.has(role.id);

            return (
              <div
                key={role.id}
                className="bg-[#1a1210] rounded-xl border border-[#3a2010] overflow-hidden"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
              >
                {/* Role header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#221810] transition-colors"
                  onClick={() => toggleRole(role.id)}
                  style={{ borderLeft: `4px solid ${role.color}` }}
                >
                  {isExpanded
                    ? <ChevronDown size={16} className="text-[#6a4828]" />
                    : <ChevronRight size={16} className="text-[#6a4828]" />
                  }

                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 font-['Cinzel',serif]"
                    style={{ backgroundColor: role.color, boxShadow: `0 0 8px ${role.color}50` }}
                  >
                    {role.name[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide">{role.name}</h3>
                      {roleGoals.length > 0 && (
                        <span className="text-xs text-[#6a4828] bg-[#2a1808] px-2 py-0.5 rounded-full border border-[#3a2010]">
                          {completedGoals.length}/{roleGoals.length} quests
                        </span>
                      )}
                    </div>
                    {role.purpose && (
                      <p className="text-sm text-[#8a6848] truncate mt-0.5">{role.purpose}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => openEditRole(role)}
                      className="p-1.5 rounded-lg hover:bg-[#3a2010] text-[#6a4828] hover:text-[#c8aa78]"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="p-1.5 rounded-lg hover:bg-[#1a0808] text-[#3a2010] hover:text-[#c02020]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Goals */}
                {isExpanded && (
                  <div className="border-t border-[#3a2010]">
                    {roleGoals.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-[#3a2010] italic">
                        No quests defined for this role yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#2a1808]">
                        {roleGoals.map(goal => (
                          <div key={goal.id} className="flex items-start gap-3 px-5 py-3 group hover:bg-[#221810]">
                            <button
                              onClick={() => updateGoal(goal.id, { completed: !goal.completed })}
                              className="shrink-0 mt-0.5"
                            >
                              {goal.completed
                                ? <CheckCircle2 size={18} className="text-[#4aaa60]" />
                                : <Circle size={18} className="text-[#3a2010] hover:text-[#6a4828]" />
                              }
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-sm ${goal.completed ? 'line-through text-[#3a2010]' : 'text-[#d4b880]'}`}>
                                {goal.title}
                              </div>
                              {goal.description && (
                                <div className="text-xs text-[#6a4828] mt-0.5">{goal.description}</div>
                              )}
                              {goal.targetDate && (
                                <div className="text-xs text-[#c05808] mt-0.5 font-medium font-['Cinzel',serif]">
                                  Target: {format(new Date(goal.targetDate), 'MMMM d, yyyy')}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => openEditGoal(goal)}
                                className="p-1 rounded hover:bg-[#3a2010] text-[#3a2010] hover:text-[#c8aa78]"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => deleteGoal(goal.id)}
                                className="p-1 rounded hover:bg-[#1a0808] text-[#3a2010] hover:text-[#c02020]"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="px-5 py-3 bg-[#140e0a] border-t border-[#3a2010]">
                      <button
                        onClick={() => openAddGoal(role.id)}
                        className="flex items-center gap-1.5 text-sm text-[#c8aa78] hover:text-[#e8d4a0] font-medium transition-colors font-['Cinzel',serif]"
                      >
                        <Plus size={14} /> Add quest for {role.name}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Role Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={editingRole ? 'Edit Role' : 'Add Life Role'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Role Name *</label>
            <input
              type="text"
              value={roleForm.name}
              onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
              className={inputClass}
              placeholder="e.g., Parent, Professional, Warrior"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Purpose Statement</label>
            <textarea
              value={roleForm.purpose}
              onChange={e => setRoleForm(f => ({ ...f, purpose: e.target.value }))}
              rows={3}
              className={inputClass}
              placeholder="What is your purpose in this role?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-2 font-['Cinzel',serif]">Color</label>
            <div className="flex gap-2 flex-wrap">
              {ROLE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setRoleForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full transition-all ${roleForm.color === c ? 'scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                  style={{
                    backgroundColor: c,
                    boxShadow: roleForm.color === c ? `0 0 8px ${c}, 0 0 2px ${c}` : 'none',
                    outline: roleForm.color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowRoleModal(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} disabled={!roleForm.name.trim()}>
              {editingRole ? 'Save Changes' : 'Add Role'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Goal Modal */}
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title={editingGoal ? 'Edit Quest' : 'Add Quest'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Role</label>
            <select
              value={goalForm.roleId}
              onChange={e => setGoalForm(f => ({ ...f, roleId: e.target.value }))}
              className={inputClass + ' bg-[#140e0a]'}
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Quest Title *</label>
            <input
              type="text"
              value={goalForm.title}
              onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
              className={inputClass}
              placeholder="What do you seek to achieve?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Description</label>
            <textarea
              value={goalForm.description}
              onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className={inputClass}
              placeholder="Why does this quest matter? How will you achieve it?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Target Date</label>
            <input
              type="date"
              value={goalForm.targetDate}
              onChange={e => setGoalForm(f => ({ ...f, targetDate: e.target.value }))}
              className={inputClass + ' bg-[#140e0a]'}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowGoalModal(false)}>Cancel</Button>
            <Button onClick={handleSaveGoal} disabled={!goalForm.title.trim()}>
              {editingGoal ? 'Save Changes' : 'Add Quest'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
