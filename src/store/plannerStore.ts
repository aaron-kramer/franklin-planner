import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlannerStore, Value, Role, Goal, Task, Appointment, BigRock, DailyNote } from '../types';
import { generateId } from '../utils/dateUtils';

const SAMPLE_ROLES: Role[] = [
  { id: 'role-self', name: 'Self', purpose: 'Develop my physical, mental, and spiritual well-being', color: '#7c3aed', order: 0 },
  { id: 'role-partner', name: 'Spouse / Partner', purpose: 'Build a loving, supportive relationship rooted in trust and shared vision', color: '#db2777', order: 1 },
  { id: 'role-parent', name: 'Parent', purpose: 'Raise confident, curious, and compassionate children who know they are loved', color: '#ea580c', order: 2 },
  { id: 'role-professional', name: 'Professional', purpose: 'Create meaningful impact through excellent work and continuous growth', color: '#1e3a5f', order: 3 },
  { id: 'role-community', name: 'Community Member', purpose: 'Contribute to a vibrant, inclusive community where everyone can thrive', color: '#16a34a', order: 4 },
  { id: 'role-spiritual', name: 'Spiritual', purpose: 'Deepen my connection to my values, faith, and inner life', color: '#0891b2', order: 5 },
  { id: 'role-learner', name: 'Lifelong Learner', purpose: 'Stay curious, keep growing, and continuously expand my knowledge and skills', color: '#d4a017', order: 6 },
];

const SAMPLE_VALUES: Value[] = [
  { id: 'val-1', name: 'Integrity', description: 'Act in alignment with my values even when no one is watching', order: 0 },
  { id: 'val-2', name: 'Family', description: 'Put my relationships at the center of my life decisions', order: 1 },
  { id: 'val-3', name: 'Growth', description: 'Continually improve myself and help others grow', order: 2 },
  { id: 'val-4', name: 'Service', description: 'Use my talents to make a positive difference in the world', order: 3 },
  { id: 'val-5', name: 'Balance', description: 'Tend to all areas of life with intention and care', order: 4 },
];

const SAMPLE_GOALS: Goal[] = [
  {
    id: 'goal-1', roleId: 'role-self', title: 'Run a 5K race',
    description: 'Train consistently and complete a local 5K this summer',
    targetDate: '2026-07-01', completed: false, createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'goal-2', roleId: 'role-professional', title: 'Complete leadership course',
    description: 'Finish the online leadership certification by Q2',
    targetDate: '2026-06-30', completed: false, createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'goal-3', roleId: 'role-community', title: 'Volunteer 20 hours this quarter',
    description: 'Find a local cause and contribute meaningfully',
    targetDate: '2026-06-30', completed: false, createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'goal-4', roleId: 'role-learner', title: 'Read 12 books this year',
    description: 'One book per month across a variety of topics',
    targetDate: '2026-12-31', completed: false, createdAt: '2026-01-01T00:00:00Z'
  },
];

const SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1', title: 'Review quarterly report and prepare summary', priority: 'A', priorityNumber: 1,
    date: '2026-04-16', status: 'pending', roleId: 'role-professional',
    notes: 'Share with team by EOD', createdAt: '2026-04-16T06:00:00Z'
  },
  {
    id: 'task-2', title: 'Call mom for her birthday', priority: 'A', priorityNumber: 2,
    date: '2026-04-16', status: 'pending', roleId: 'role-partner',
    createdAt: '2026-04-16T06:00:00Z'
  },
  {
    id: 'task-3', title: 'Morning run – 3 miles', priority: 'B', priorityNumber: 1,
    date: '2026-04-16', status: 'completed', roleId: 'role-self',
    createdAt: '2026-04-16T06:00:00Z'
  },
  {
    id: 'task-4', title: 'Review chapter 4 of leadership book', priority: 'B', priorityNumber: 2,
    date: '2026-04-16', status: 'pending', roleId: 'role-learner', goalId: 'goal-4',
    createdAt: '2026-04-16T06:00:00Z'
  },
  {
    id: 'task-5', title: 'Schedule dentist appointment', priority: 'C', priorityNumber: 1,
    date: '2026-04-16', status: 'pending', roleId: 'role-self',
    createdAt: '2026-04-16T06:00:00Z'
  },
  {
    id: 'task-6', title: 'Prepare weekly team stand-up agenda', priority: 'A', priorityNumber: 1,
    date: '2026-04-17', status: 'pending', roleId: 'role-professional',
    createdAt: '2026-04-16T06:00:00Z'
  },
];

const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1', title: 'Team Stand-up', date: '2026-04-16',
    startTime: '09:00', endTime: '09:30', roleId: 'role-professional',
    location: 'Conference Room B'
  },
  {
    id: 'appt-2', title: 'Lunch with Sarah', date: '2026-04-16',
    startTime: '12:00', endTime: '13:00', roleId: 'role-partner',
    location: 'The Green Table'
  },
  {
    id: 'appt-3', title: 'Leadership Course – Module 3', date: '2026-04-17',
    startTime: '19:00', endTime: '20:30', roleId: 'role-professional',
  },
  {
    id: 'appt-4', title: '1:1 with Manager', date: '2026-04-17',
    startTime: '14:00', endTime: '14:30', roleId: 'role-professional',
  },
];

const SAMPLE_BIG_ROCKS: BigRock[] = [
  { id: 'br-1', weekStart: '2026-04-13', roleId: 'role-professional', title: 'Finish quarterly report', scheduledDate: '2026-04-16' },
  { id: 'br-2', weekStart: '2026-04-13', roleId: 'role-self', title: 'Run 3x this week', scheduledDate: '2026-04-14' },
  { id: 'br-3', weekStart: '2026-04-13', roleId: 'role-learner', title: 'Read 50 pages of leadership book' },
  { id: 'br-4', weekStart: '2026-04-13', roleId: 'role-community', title: 'Contact food bank volunteer coordinator' },
];

const SAMPLE_NOTES: DailyNote[] = [
  {
    date: '2026-04-16',
    content: 'Key insight from morning reading: "The main thing is to keep the main thing the main thing." — Stephen Covey\n\nRemember to follow up with David about the project timeline after the stand-up.'
  }
];

const SAMPLE_MISSION = `I am at my best when I am fully present — as a loving partner, a supportive parent, and a passionate professional. I will work to be a person of integrity, striving each day to align my actions with my deepest values.

My life's purpose is to grow continuously, serve generously, and leave every person and place better than I found them. I will invest in my relationships, nurture my health and spirit, and make meaningful contributions through my work and community involvement.

I will judge my success by the depth of my relationships, the quality of my character, and the positive difference I make in the lives of those around me.`;

interface StoreState extends PlannerStore {}

export const usePlannerStore = create<StoreState>()(
  persist(
    (set, get) => ({
      missionStatement: SAMPLE_MISSION,
      values: SAMPLE_VALUES,
      roles: SAMPLE_ROLES,
      goals: SAMPLE_GOALS,
      tasks: SAMPLE_TASKS,
      appointments: SAMPLE_APPOINTMENTS,
      bigRocks: SAMPLE_BIG_ROCKS,
      dailyNotes: SAMPLE_NOTES,

      setMissionStatement: (statement) => set({ missionStatement: statement }),

      addValue: (value) => {
        const values = get().values;
        set({
          values: [...values, { ...value, id: generateId(), order: values.length }]
        });
      },
      updateValue: (id, updates) => set(state => ({
        values: state.values.map(v => v.id === id ? { ...v, ...updates } : v)
      })),
      deleteValue: (id) => set(state => ({
        values: state.values.filter(v => v.id !== id)
      })),
      reorderValues: (values) => set({ values }),

      addRole: (role) => {
        const roles = get().roles;
        set({
          roles: [...roles, { ...role, id: generateId(), order: roles.length }]
        });
      },
      updateRole: (id, updates) => set(state => ({
        roles: state.roles.map(r => r.id === id ? { ...r, ...updates } : r)
      })),
      deleteRole: (id) => set(state => ({
        roles: state.roles.filter(r => r.id !== id)
      })),
      reorderRoles: (roles) => set({ roles }),

      addGoal: (goal) => set(state => ({
        goals: [...state.goals, { ...goal, id: generateId(), createdAt: new Date().toISOString() }]
      })),
      updateGoal: (id, updates) => set(state => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
      })),
      deleteGoal: (id) => set(state => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

      addTask: (task) => set(state => ({
        tasks: [...state.tasks, { ...task, id: generateId(), createdAt: new Date().toISOString() }]
      })),
      updateTask: (id, updates) => set(state => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTask: (id) => set(state => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      addAppointment: (appointment) => set(state => ({
        appointments: [...state.appointments, { ...appointment, id: generateId() }]
      })),
      updateAppointment: (id, updates) => set(state => ({
        appointments: state.appointments.map(a => a.id === id ? { ...a, ...updates } : a)
      })),
      deleteAppointment: (id) => set(state => ({
        appointments: state.appointments.filter(a => a.id !== id)
      })),

      addBigRock: (bigRock) => set(state => ({
        bigRocks: [...state.bigRocks, { ...bigRock, id: generateId() }]
      })),
      updateBigRock: (id, updates) => set(state => ({
        bigRocks: state.bigRocks.map(b => b.id === id ? { ...b, ...updates } : b)
      })),
      deleteBigRock: (id) => set(state => ({
        bigRocks: state.bigRocks.filter(b => b.id !== id)
      })),

      setDailyNote: (date, content) => set(state => {
        const existing = state.dailyNotes.find(n => n.date === date);
        if (existing) {
          return { dailyNotes: state.dailyNotes.map(n => n.date === date ? { ...n, content } : n) };
        }
        return { dailyNotes: [...state.dailyNotes, { date, content }] };
      }),
    }),
    {
      name: 'franklin-planner-storage',
    }
  )
);
