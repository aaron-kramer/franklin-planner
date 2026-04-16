import { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { usePlannerStore } from '../../store/plannerStore';
import type { Role, Goal } from '../../types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { format } from 'date-fns';

const ROLE_COLORS = [
  '#7c3aed', '#db2777', '#ea580c', '#1e3a5f',
  '#16a34a', '#0891b2', '#d4a017', '#6b7280',
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Roles & Goals</h1>
          <p className="text-sm text-gray-400 mt-1">Define your key life roles and the goals that matter most in each</p>
        </div>
        <Button onClick={openAddRole}>
          <Plus size={14} /> Add Role
        </Button>
      </div>

      {roles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 mb-4">No roles defined yet. The Franklin Planner recommends defining 6–7 key life roles.</p>
          <Button onClick={openAddRole}><Plus size={14} /> Add your first role</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRoles.map(role => {
            const roleGoals = goals.filter(g => g.roleId === role.id);
            const completedGoals = roleGoals.filter(g => g.completed);
            const isExpanded = expandedRoles.has(role.id);

            return (
              <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Role header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleRole(role.id)}
                  style={{ borderLeft: `4px solid ${role.color}` }}
                >
                  {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}

                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: role.color }}
                  >
                    {role.name[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{role.name}</h3>
                      {roleGoals.length > 0 && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {completedGoals.length}/{roleGoals.length} goals
                        </span>
                      )}
                    </div>
                    {role.purpose && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">{role.purpose}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => openEditRole(role)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Goals */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {roleGoals.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-gray-400 italic">
                        No goals defined for this role yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {roleGoals.map(goal => (
                          <div key={goal.id} className="flex items-start gap-3 px-5 py-3 group hover:bg-gray-50">
                            <button
                              onClick={() => updateGoal(goal.id, { completed: !goal.completed })}
                              className="shrink-0 mt-0.5"
                            >
                              {goal.completed
                                ? <CheckCircle2 size={18} className="text-green-500" />
                                : <Circle size={18} className="text-gray-300 hover:text-gray-400" />
                              }
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-sm text-gray-800 ${goal.completed ? 'line-through text-gray-400' : ''}`}>
                                {goal.title}
                              </div>
                              {goal.description && (
                                <div className="text-xs text-gray-400 mt-0.5">{goal.description}</div>
                              )}
                              {goal.targetDate && (
                                <div className="text-xs text-[#d4a017] mt-0.5 font-medium">
                                  Target: {format(new Date(goal.targetDate), 'MMMM d, yyyy')}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => openEditGoal(goal)}
                                className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => deleteGoal(goal.id)}
                                className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100">
                      <button
                        onClick={() => openAddGoal(role.id)}
                        className="flex items-center gap-1.5 text-sm text-[#1e3a5f] hover:text-[#d4a017] font-medium transition-colors"
                      >
                        <Plus size={14} /> Add goal for {role.name}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
            <input
              type="text"
              value={roleForm.name}
              onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              placeholder="e.g., Parent, Professional, Community Member"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose Statement</label>
            <textarea
              value={roleForm.purpose}
              onChange={e => setRoleForm(f => ({ ...f, purpose: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              placeholder="What is your purpose in this role?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {ROLE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setRoleForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full transition-all ${roleForm.color === c ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
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
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title={editingGoal ? 'Edit Goal' : 'Add Goal'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={goalForm.roleId}
              onChange={e => setGoalForm(f => ({ ...f, roleId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title *</label>
            <input
              type="text"
              value={goalForm.title}
              onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              placeholder="What do you want to achieve?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={goalForm.description}
              onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              placeholder="Why does this goal matter? How will you achieve it?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
            <input
              type="date"
              value={goalForm.targetDate}
              onChange={e => setGoalForm(f => ({ ...f, targetDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowGoalModal(false)}>Cancel</Button>
            <Button onClick={handleSaveGoal} disabled={!goalForm.title.trim()}>
              {editingGoal ? 'Save Changes' : 'Add Goal'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
