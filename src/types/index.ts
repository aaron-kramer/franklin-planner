export interface Value {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface Role {
  id: string;
  name: string;
  purpose: string;
  color: string;
  order: number;
}

export interface Goal {
  id: string;
  roleId: string;
  title: string;
  description: string;
  targetDate?: string;
  completed: boolean;
  createdAt: string;
}

export type Priority = 'A' | 'B' | 'C';
export type TaskStatus = 'pending' | 'completed' | 'delegated' | 'carried-forward' | 'eliminated';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  priorityNumber: number;
  date: string; // YYYY-MM-DD
  status: TaskStatus;
  roleId?: string;
  goalId?: string;
  notes?: string;
  delegatedTo?: string;
  originalDate?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  roleId?: string;
  notes?: string;
  location?: string;
}

export interface BigRock {
  id: string;
  weekStart: string; // Monday YYYY-MM-DD
  roleId: string;
  title: string;
  scheduledDate?: string; // YYYY-MM-DD
  taskId?: string;
}

export interface DailyNote {
  date: string; // YYYY-MM-DD
  content: string;
}

export interface PlannerStore {
  missionStatement: string;
  values: Value[];
  roles: Role[];
  goals: Goal[];
  tasks: Task[];
  appointments: Appointment[];
  bigRocks: BigRock[];
  dailyNotes: DailyNote[];
  // Actions
  setMissionStatement: (statement: string) => void;
  addValue: (value: Omit<Value, 'id' | 'order'>) => void;
  updateValue: (id: string, updates: Partial<Value>) => void;
  deleteValue: (id: string) => void;
  reorderValues: (values: Value[]) => void;
  addRole: (role: Omit<Role, 'id' | 'order'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  reorderRoles: (roles: Role[]) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addBigRock: (bigRock: Omit<BigRock, 'id'>) => void;
  updateBigRock: (id: string, updates: Partial<BigRock>) => void;
  deleteBigRock: (id: string) => void;
  setDailyNote: (date: string, content: string) => void;
}
