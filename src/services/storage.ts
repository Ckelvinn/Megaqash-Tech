import {
  User,
  TaskItem,
  TaskSubmission,
  HallOfFameEntry,
  WithdrawalRequest,
  PublishedSpotlight,
} from '../types';

export const ADMIN_PASSWORD = 'Admin200';
export const MPESA_TILL = '8286400';
export const MPESA_ACCOUNT_NAME = 'Firiop enterprises';
export const ACTIVATION_AMOUNT = 500;
export const REFERRAL_BONUS = 300;
export const MIN_WITHDRAWAL = 300;

const STORAGE_KEYS = {
  USERS: 'megaqash_users_v1',
  CURRENT_USER_ID: 'megaqash_current_user_id',
  IS_ADMIN_LOGGED_IN: 'megaqash_is_admin_logged_in',
  TASKS: 'megaqash_tasks_v1',
  SUBMISSIONS: 'megaqash_submissions_v1',
  HALL_OF_FAME: 'megaqash_hall_of_fame_v1',
  WITHDRAWALS: 'megaqash_withdrawals_v1',
};

// Safe localStorage getters
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to set storage key ${key}:`, e);
  }
}

export function getSpotlights(): PublishedSpotlight[] {
  return [];
}

export function removeSpotlight(id: string): void {
  // spotlight removed
}

// User Methods
export function getUsers(): User[] {
  return getStored<User[]>(STORAGE_KEYS.USERS, []);
}

export function saveUsers(users: User[]): void {
  setStored(STORAGE_KEYS.USERS, users);
}

export function getCurrentUser(): User | null {
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  if (!currentId) return null;
  const users = getUsers();
  return users.find((u) => u.id === currentId) || null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }
}

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(STORAGE_KEYS.IS_ADMIN_LOGGED_IN) === 'true';
}

export function setAdminLoggedIn(status: boolean): void {
  if (status) {
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN_LOGGED_IN, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.IS_ADMIN_LOGGED_IN);
  }
}

// Server Synchronization: Fetches all shared data so all devices see the same users!
export async function syncFromServer(): Promise<{ users: User[]; tasks: TaskItem[] }> {
  try {
    const [usersRes, tasksRes, subsRes, hofRes, wdRes] = await Promise.all([
      fetch('/api/users').then((r) => r.json()).catch(() => null),
      fetch('/api/tasks').then((r) => r.json()).catch(() => null),
      fetch('/api/submissions').then((r) => r.json()).catch(() => null),
      fetch('/api/hall-of-fame').then((r) => r.json()).catch(() => null),
      fetch('/api/withdrawals').then((r) => r.json()).catch(() => null),
    ]);

    if (usersRes && usersRes.success && Array.isArray(usersRes.users)) {
      saveUsers(usersRes.users);
      // Update current user if exists
      const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (currentId) {
        const found = usersRes.users.find((u: User) => u.id === currentId);
        if (found) {
          // Current user updated with latest server state
        }
      }
    }

    if (tasksRes && tasksRes.success && Array.isArray(tasksRes.tasks)) {
      setStored(STORAGE_KEYS.TASKS, tasksRes.tasks);
    }

    if (subsRes && subsRes.success && Array.isArray(subsRes.submissions)) {
      setStored(STORAGE_KEYS.SUBMISSIONS, subsRes.submissions);
    }

    if (hofRes && hofRes.success && Array.isArray(hofRes.hallOfFame)) {
      setStored(STORAGE_KEYS.HALL_OF_FAME, hofRes.hallOfFame);
    }

    if (wdRes && wdRes.success && Array.isArray(wdRes.withdrawals)) {
      setStored(STORAGE_KEYS.WITHDRAWALS, wdRes.withdrawals);
    }

    return {
      users: getUsers(),
      tasks: getTasks(),
    };
  } catch (err) {
    console.error('Failed to sync from server:', err);
    return {
      users: getUsers(),
      tasks: getTasks(),
    };
  }
}

// Registration - calls server API to store in central DB accessible by admin!
export async function registerUserAsync(params: {
  username: string;
  fullName: string;
  phone: string;
  password: string;
  referrerUsername?: string;
}): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();

    if (data.success && data.user) {
      const users = getUsers();
      users.push(data.user);
      saveUsers(users);
      setCurrentUser(data.user);
      return { success: true, message: 'Registration successful!', user: data.user };
    }

    return { success: false, message: data.message || 'Registration failed.' };
  } catch (err) {
    // Fallback locally
    return registerUserLocally(params);
  }
}

function registerUserLocally(params: {
  username: string;
  fullName: string;
  phone: string;
  password: string;
  referrerUsername?: string;
}): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  const cleanUsername = params.username.trim().toLowerCase();

  if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return { success: false, message: 'Username is already registered.' };
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    username: cleanUsername,
    fullName: params.fullName.trim(),
    phone: params.phone.trim(),
    password: params.password,
    role: 'user',
    isActivated: false,
    activationStatus: 'none',
    availableBalance: 0,
    totalEarnings: 0,
    referrerUsername: params.referrerUsername ? params.referrerUsername.trim().toLowerCase() : undefined,
    registeredAt: new Date().toISOString(),
    referralBonusEarned: 0,
  };

  if (newUser.referrerUsername) {
    const refIdx = users.findIndex(
      (u) => u.username.toLowerCase() === newUser.referrerUsername!.toLowerCase()
    );
    if (refIdx !== -1) {
      users[refIdx].availableBalance = (users[refIdx].availableBalance || 0) + REFERRAL_BONUS;
      users[refIdx].referralBonusEarned = (users[refIdx].referralBonusEarned || 0) + REFERRAL_BONUS;
    }
  }

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  // Also dispatch to server DB in background
  fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }).catch((err) => console.error('Background server sync error:', err));

  return { success: true, message: 'Registration successful!', user: newUser };
}

export function registerUser(params: {
  username: string;
  fullName: string;
  phone: string;
  password: string;
  referrerUsername?: string;
}): { success: boolean; message: string; user?: User } {
  return registerUserLocally(params);
}

export function loginUser(username: string, password: string): { success: boolean; message: string; user?: User } {
  return loginUserLocally(username, password);
}

export function submitMpesaActivation(userId: string, mpesaCode: string): { success: boolean; message: string; user?: User } {
  // Dispatch to server in background
  fetch('/api/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, mpesaCode }),
  }).catch(() => null);
  return submitMpesaActivationLocally(userId, mpesaCode);
}

export function adminApproveActivation(userId: string, payerPhone?: string, customCode?: string): { success: boolean; message: string } {
  fetch('/api/admin/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, payerPhone, customCode }),
  }).catch(() => null);
  return adminApproveActivationLocally(userId, payerPhone, customCode);
}

export function adminDeactivateUser(userId: string): { success: boolean; message: string } {
  fetch('/api/admin/deactivate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }).catch(() => null);
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, message: 'User not found' };
  users[index].isActivated = false;
  users[index].activationStatus = 'rejected';
  saveUsers(users);
  return { success: true, message: `Account for ${users[index].username} deactivated.` };
}

export function adminAdjustBalance(userId: string, amountChange: number, reason: string): { success: boolean; message: string; newBalance?: number } {
  fetch('/api/admin/adjust-balance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amountChange, reason }),
  }).catch(() => null);
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, message: 'User not found' };
  const current = users[index].availableBalance;
  const updated = Math.max(0, current + amountChange);
  users[index].availableBalance = updated;
  saveUsers(users);
  return { success: true, message: `Adjusted balance of ${users[index].username} by KSh ${amountChange > 0 ? '+' : ''}${amountChange}`, newBalance: updated };
}

export function addTask(task: TaskItem): void {
  fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  }).catch(() => null);
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
}

export function deleteTask(taskId: string): void {
  fetch(`/api/tasks/${taskId}`, { method: 'DELETE' }).catch(() => null);
  const tasks = getTasks().filter((t) => t.id !== taskId);
  saveTasks(tasks);
}

export function submitUserTask(params: {
  taskId: string;
  taskType: TaskItem['type'];
  taskTitle: string;
  userId: string;
  username: string;
  userPhone: string;
  content: string;
  selectedOption?: string;
  rewardAmount: number;
}): { success: boolean; message: string } {
  submitUserTaskAsync(params).catch(() => null);
  const submissions = getSubmissions();
  const newSub: TaskSubmission = {
    id: `sub-${Date.now()}`,
    taskId: params.taskId,
    taskType: params.taskType,
    taskTitle: params.taskTitle,
    userId: params.userId,
    username: params.username,
    userPhone: params.userPhone,
    content: params.content,
    selectedOption: params.selectedOption,
    submittedAt: new Date().toISOString(),
    status: 'pending',
    rewardAmount: params.rewardAmount,
  };
  submissions.unshift(newSub);
  saveSubmissions(submissions);
  return { success: true, message: 'Task submitted successfully! Status is Pending until Admin approves.' };
}

export function adminReviewSubmission(params: {
  submissionId: string;
  approved: boolean;
  adminFeedback?: string;
  publishToSpotlight?: boolean;
}): { success: boolean; message: string } {
  adminReviewSubmissionAsync(params).catch(() => null);
  return { success: true, message: params.approved ? 'Submission approved.' : 'Submission rejected.' };
}

export function addHallOfFameMember(params: {
  userName: string;
  userPhone: string;
  amountCredited: number;
  achievementTitle: string;
  congratsMessage: string;
  category: 'blog' | 'academic' | 'admin_added';
}): void {
  addHallOfFameMemberAsync(params).catch(() => null);
}

export function removeHallOfFameMember(id: string): void {
  removeHallOfFameMemberAsync(id).catch(() => null);
}

export function requestWithdrawal(params: {
  userId: string;
  username: string;
  phone: string;
  amount: number;
}): { success: boolean; message: string } {
  requestWithdrawalAsync(params).catch(() => null);
  return { success: true, message: `Withdrawal request for KSh ${params.amount} submitted!` };
}

export function adminReviewWithdrawal(withdrawalId: string, approved: boolean): { success: boolean; message: string } {
  adminReviewWithdrawalAsync(withdrawalId, approved).catch(() => null);
  return { success: true, message: approved ? 'Withdrawal marked as Paid!' : 'Withdrawal rejected.' };
}

// Login
export async function loginUserAsync(
  username: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (data.success && data.user) {
      setCurrentUser(data.user);
      // Sync local users
      await syncFromServer();
      return { success: true, message: 'Logged in successfully.', user: data.user };
    }
    return { success: false, message: data.message || 'Invalid username or password.' };
  } catch (err) {
    // Fallback to local
    return loginUserLocally(username, password);
  }
}

function loginUserLocally(
  username: string,
  password: string
): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return { success: false, message: 'Invalid username or password. Please try again.' };
  }

  setCurrentUser(user);
  return { success: true, message: 'Logged in successfully.', user };
}

// Submit M-Pesa Activation Code
export async function submitMpesaActivationAsync(
  userId: string,
  mpesaCode: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const res = await fetch('/api/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, mpesaCode }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      await syncFromServer();
      return { success: true, message: data.message, user: data.user };
    }
    return { success: false, message: data.message || 'Activation failed.' };
  } catch (err) {
    return submitMpesaActivationLocally(userId, mpesaCode);
  }
}

function submitMpesaActivationLocally(
  userId: string,
  mpesaCode: string
): { success: boolean; message: string; user?: User } {
  const cleanCode = mpesaCode.trim().toUpperCase();
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, message: 'User not found.' };
  }

  users[index].mpesaCode = cleanCode;
  users[index].activationStatus = 'pending';
  users[index].activationSubmittedAt = new Date().toISOString();
  saveUsers(users);

  const updated = users[index];
  if (getCurrentUser()?.id === userId) {
    setCurrentUser(updated);
  }

  return {
    success: true,
    message: 'M-Pesa code submitted successfully! Your account activation is now pending Admin approval.',
    user: updated,
  };
}

// Admin activate ANY user (with optional different phone and custom code)
export async function adminApproveActivationAsync(
  userId: string,
  payerPhone?: string,
  customCode?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/admin/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, payerPhone, customCode }),
    });
    const data = await res.json();
    await syncFromServer();
    return { success: data.success, message: data.message };
  } catch (err) {
    return adminApproveActivationLocally(userId, payerPhone, customCode);
  }
}

function adminApproveActivationLocally(
  userId: string,
  payerPhone?: string,
  customCode?: string
): { success: boolean; message: string } {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, message: 'User not found' };

  users[index].isActivated = true;
  users[index].activationStatus = 'approved';
  if (customCode) {
    users[index].mpesaCode = customCode.trim().toUpperCase();
  } else if (!users[index].mpesaCode) {
    users[index].mpesaCode = 'ADMIN_OVERRIDE';
  }
  saveUsers(users);

  if (getCurrentUser()?.id === userId) {
    setCurrentUser(users[index]);
  }
  return {
    success: true,
    message: `Account for ${users[index].username} (${users[index].phone}${
      payerPhone ? ` / Payer Phone: ${payerPhone}` : ''
    }) has been activated successfully!`,
  };
}

// Admin deactivate user
export async function adminDeactivateUserAsync(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/admin/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    await syncFromServer();
    return { success: data.success, message: data.message };
  } catch (err) {
    const users = getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return { success: false, message: 'User not found' };
    users[index].isActivated = false;
    users[index].activationStatus = 'rejected';
    saveUsers(users);
    return { success: true, message: `Account for ${users[index].username} deactivated.` };
  }
}

// Admin adjust balance
export async function adminAdjustBalanceAsync(
  userId: string,
  amountChange: number,
  reason: string
): Promise<{ success: boolean; message: string; newBalance?: number }> {
  try {
    const res = await fetch('/api/admin/adjust-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amountChange, reason }),
    });
    const data = await res.json();
    await syncFromServer();
    return data;
  } catch (err) {
    const users = getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return { success: false, message: 'User not found' };
    const current = users[index].availableBalance;
    const updated = Math.max(0, current + amountChange);
    users[index].availableBalance = updated;
    saveUsers(users);
    return { success: true, message: 'Balance adjusted locally.', newBalance: updated };
  }
}

// Tasks
export function getTasks(): TaskItem[] {
  return getStored<TaskItem[]>(STORAGE_KEYS.TASKS, []);
}

export function saveTasks(tasks: TaskItem[]): void {
  setStored(STORAGE_KEYS.TASKS, tasks);
}

export async function addTaskAsync(task: TaskItem): Promise<void> {
  try {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    await syncFromServer();
  } catch (e) {
    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);
  }
}

export async function deleteTaskAsync(taskId: string): Promise<void> {
  try {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    await syncFromServer();
  } catch (e) {
    const tasks = getTasks().filter((t) => t.id !== taskId);
    saveTasks(tasks);
  }
}

// Submissions
export function getSubmissions(): TaskSubmission[] {
  return getStored<TaskSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
}

export function saveSubmissions(submissions: TaskSubmission[]): void {
  setStored(STORAGE_KEYS.SUBMISSIONS, submissions);
}

export async function submitUserTaskAsync(params: {
  taskId: string;
  taskType: TaskItem['type'];
  taskTitle: string;
  userId: string;
  username: string;
  userPhone: string;
  content: string;
  selectedOption?: string;
  rewardAmount: number;
}): Promise<{ success: boolean; message: string }> {
  try {
    const newSub: TaskSubmission = {
      id: `sub-${Date.now()}`,
      taskId: params.taskId,
      taskType: params.taskType,
      taskTitle: params.taskTitle,
      userId: params.userId,
      username: params.username,
      userPhone: params.userPhone,
      content: params.content,
      selectedOption: params.selectedOption,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      rewardAmount: params.rewardAmount,
    };

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSub),
    });
    const data = await res.json();
    await syncFromServer();
    return {
      success: data.success,
      message: data.message || 'Task submitted successfully! Status is Pending until Admin approves.',
    };
  } catch (err) {
    return { success: true, message: 'Task submitted! Pending admin review.' };
  }
}

export async function adminReviewSubmissionAsync(params: {
  submissionId: string;
  approved: boolean;
  adminFeedback?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/admin/submissions/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    await syncFromServer();
    return data;
  } catch (err) {
    return { success: true, message: 'Review completed.' };
  }
}

// Hall of Fame
export function getHallOfFame(): HallOfFameEntry[] {
  return getStored<HallOfFameEntry[]>(STORAGE_KEYS.HALL_OF_FAME, []);
}

export async function addHallOfFameMemberAsync(params: {
  userName: string;
  userPhone: string;
  amountCredited: number;
  achievementTitle: string;
  congratsMessage: string;
  category: 'blog' | 'academic' | 'admin_added';
}): Promise<void> {
  const newEntry: HallOfFameEntry = {
    id: `hof-${Date.now()}`,
    userName: params.userName,
    userPhone: params.userPhone,
    amountCredited: params.amountCredited,
    achievementTitle: params.achievementTitle,
    congratsMessage: params.congratsMessage,
    date: new Date().toISOString().split('T')[0],
    category: params.category,
  };
  try {
    await fetch('/api/admin/hall-of-fame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });
    await syncFromServer();
  } catch (e) {
    const list = getHallOfFame();
    list.unshift(newEntry);
    setStored(STORAGE_KEYS.HALL_OF_FAME, list);
  }
}

export async function removeHallOfFameMemberAsync(id: string): Promise<void> {
  try {
    await fetch(`/api/admin/hall-of-fame/${id}`, { method: 'DELETE' });
    await syncFromServer();
  } catch (e) {
    const list = getHallOfFame().filter((e) => e.id !== id);
    setStored(STORAGE_KEYS.HALL_OF_FAME, list);
  }
}

// Withdrawals
export function getWithdrawals(): WithdrawalRequest[] {
  return getStored<WithdrawalRequest[]>(STORAGE_KEYS.WITHDRAWALS, []);
}

export async function requestWithdrawalAsync(params: {
  userId: string;
  username: string;
  phone: string;
  amount: number;
}): Promise<{ success: boolean; message: string }> {
  if (params.amount < MIN_WITHDRAWAL) {
    return { success: false, message: `Minimum withdrawal amount is KSh ${MIN_WITHDRAWAL}.` };
  }

  try {
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (data.success) {
      await syncFromServer();
      return {
        success: true,
        message: `Withdrawal request for KSh ${params.amount} to M-Pesa ${params.phone} submitted!`,
      };
    }
    return { success: false, message: data.message || 'Withdrawal request failed.' };
  } catch (e) {
    return { success: false, message: 'Server connection error.' };
  }
}

export async function adminReviewWithdrawalAsync(
  withdrawalId: string,
  approved: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/admin/withdrawals/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId, approved }),
    });
    const data = await res.json();
    await syncFromServer();
    return data;
  } catch (e) {
    return { success: true, message: 'Withdrawal updated.' };
  }
}

// Downlines
export function getUserDownlines(username: string): User[] {
  const clean = username.trim().toLowerCase();
  const users = getUsers();
  return users.filter((u) => u.referrerUsername?.toLowerCase() === clean);
}
