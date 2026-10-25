import React, { useState } from 'react';
import {
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Trophy,
  DollarSign,
  FileCheck,
  Languages,
  HelpCircle,
  ArrowRight,
  Sparkles,
  LogOut,
  Search,
  AlertCircle,
  Phone,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Share2,
  Smartphone,
  Zap,
} from 'lucide-react';
import {
  User,
  TaskItem,
  TaskSubmission,
  HallOfFameEntry,
  WithdrawalRequest,
  PublishedSpotlight,
} from '../types';
import {
  getUsers,
  adminApproveActivationAsync,
  adminDeactivateUserAsync,
  adminAdjustBalanceAsync,
  getTasks,
  addTaskAsync,
  deleteTaskAsync,
  getSubmissions,
  adminReviewSubmissionAsync,
  getHallOfFame,
  addHallOfFameMemberAsync,
  removeHallOfFameMemberAsync,
  getWithdrawals,
  adminReviewWithdrawalAsync,
  getSpotlights,
  removeSpotlight,
  getUserDownlines,
  setAdminLoggedIn,
  syncFromServer,
} from '../services/storage';

interface AdminDashboardProps {
  onExitAdmin: () => void;
  onRefreshAll: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onExitAdmin,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<
    'activations' | 'users' | 'submissions' | 'tasks' | 'hall_of_fame' | 'withdrawals'
  >('activations');

  const [users, setUsers] = useState<User[]>(getUsers());
  const [tasks, setTasks] = useState<TaskItem[]>(getTasks());
  const [submissions, setSubmissions] = useState<TaskSubmission[]>(getSubmissions());
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>(getHallOfFame());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(getWithdrawals());
  const [spotlights, setSpotlights] = useState<PublishedSpotlight[]>(getSpotlights());

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserDownlines, setExpandedUserDownlines] = useState<Record<string, boolean>>({});

  // Feedback notifications
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal / Form state for Add/Deduct Balance
  const [balanceModalUser, setBalanceModalUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number>(100);
  const [balanceAction, setBalanceAction] = useState<'add' | 'deduct'>('add');
  const [balanceReason, setBalanceReason] = useState('Admin adjustment');

  // Modal / Form state for Custom Phone Activation
  const [activateModalUser, setActivateModalUser] = useState<User | null>(null);
  const [differentPayerPhone, setDifferentPayerPhone] = useState('');
  const [customMpesaCode, setCustomMpesaCode] = useState('');

  // Modal / Form state for Add Task
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskType, setNewTaskType] = useState<TaskItem['type']>('blog');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskReward, setNewTaskReward] = useState<number>(100);
  const [newTaskExtra1, setNewTaskExtra1] = useState('');
  const [newTaskExtra2, setNewTaskExtra2] = useState('');

  // Modal / Form state for Manual Add to Hall of Fame
  const [isAddHofOpen, setIsAddHofOpen] = useState(false);
  const [hofName, setHofName] = useState('');
  const [hofPhone, setHofPhone] = useState('');
  const [hofAmount, setHofAmount] = useState<number>(100);
  const [hofTitle, setHofTitle] = useState('');
  const [hofMessage, setHofMessage] = useState('');

  const refreshLocalData = async () => {
    await syncFromServer();
    setUsers(getUsers());
    setTasks(getTasks());
    setSubmissions(getSubmissions());
    setHallOfFame(getHallOfFame());
    setWithdrawals(getWithdrawals());
    setSpotlights(getSpotlights());
    onRefreshAll();
  };

  // Poll server every 2.5 seconds while on admin panel so any new registered member appears automatically
  React.useEffect(() => {
    refreshLocalData();
    const interval = setInterval(() => {
      syncFromServer().then(() => {
        setUsers(getUsers());
        setTasks(getTasks());
        setSubmissions(getSubmissions());
        setHallOfFame(getHallOfFame());
        setWithdrawals(getWithdrawals());
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // 1. Activation handlers - works for ANY user regardless of phone used
  const handleDirectApproveActivation = async (userId: string) => {
    const res = await adminApproveActivationAsync(userId);
    await refreshLocalData();
    showNotice(res.message);
  };

  const handleCustomPhoneActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activateModalUser) return;
    const res = await adminApproveActivationAsync(
      activateModalUser.id,
      differentPayerPhone.trim(),
      customMpesaCode.trim()
    );
    setActivateModalUser(null);
    setDifferentPayerPhone('');
    setCustomMpesaCode('');
    await refreshLocalData();
    showNotice(res.message);
  };

  const handleDeactivateUser = async (userId: string) => {
    const res = await adminDeactivateUserAsync(userId);
    await refreshLocalData();
    showNotice(res.message);
  };

  // 2. Balance adjustment handler
  const handleApplyBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModalUser) return;
    const delta = balanceAction === 'add' ? Number(balanceAmount) : -Number(balanceAmount);
    const res = await adminAdjustBalanceAsync(balanceModalUser.id, delta, balanceReason);
    setBalanceModalUser(null);
    await refreshLocalData();
    showNotice(res.message);
  };

  // 3. Task submission review
  const handleReviewSubmission = async (
    submissionId: string,
    approved: boolean,
    publishToSpotlight = false
  ) => {
    const res = await adminReviewSubmissionAsync({
      submissionId,
      approved,
      adminFeedback: approved ? 'Approved by Admin' : 'Review criteria not met',
    });
    await refreshLocalData();
    showNotice(res.message);
  };

  // 4. Create new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      type: newTaskType,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      reward: Number(newTaskReward) || 5,
    };

    if (newTaskType === 'translation') {
      newTask.sourceText = newTaskExtra1.trim();
      newTask.sourceLanguage = 'English';
      newTask.targetLanguage = newTaskExtra2.trim() || 'Kiswahili';
    } else if (newTaskType === 'trivia') {
      newTask.question = newTaskExtra1.trim();
      newTask.options = newTaskExtra2
        ? newTaskExtra2.split(',').map((o) => o.trim())
        : ['Option A', 'Option B', 'Option C', 'Option D'];
    }

    await addTaskAsync(newTask);
    setIsAddTaskOpen(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskExtra1('');
    setNewTaskExtra2('');
    await refreshLocalData();
    showNotice(`New ${newTaskType} task added successfully!`);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTaskAsync(taskId);
    await refreshLocalData();
    showNotice('Task removed from user catalog.');
  };

  // 5. Hall of Fame
  const handleAddHof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hofName.trim() || !hofPhone.trim()) return;
    await addHallOfFameMemberAsync({
      userName: hofName.trim(),
      userPhone: hofPhone.trim(),
      amountCredited: Number(hofAmount) || 100,
      achievementTitle: hofTitle.trim(),
      congratsMessage:
        hofMessage.trim() ||
        `Congratulations to ${hofName} (${hofPhone})! Awarded KSh ${hofAmount} for approved blog writing.`,
      category: 'admin_added',
    });
    setIsAddHofOpen(false);
    setHofName('');
    setHofPhone('');
    setHofTitle('');
    setHofMessage('');
    await refreshLocalData();
    showNotice('Member added to Hall of Fame!');
  };

  const handleRemoveHof = async (id: string) => {
    await removeHallOfFameMemberAsync(id);
    await refreshLocalData();
    showNotice('Hall of Fame entry removed.');
  };

  const handleRemoveSpotlight = (id: string) => {
    removeSpotlight(id);
    refreshLocalData();
    showNotice('Task Dashboard Transparency Spotlight removed.');
  };

  // 6. Withdrawals
  const handleReviewWithdrawal = async (id: string, approved: boolean) => {
    const res = await adminReviewWithdrawalAsync(id, approved);
    await refreshLocalData();
    showNotice(res.message);
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    onExitAdmin();
  };

  // Filtered queries
  const pendingActivations = users.filter((u) => u.activationStatus === 'pending');
  const unactivatedUsers = users.filter((u) => !u.isActivated);
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Admin Top Navigation */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center shadow-lg border border-emerald-500/40">
              MQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">
                  MegaQash Master Console
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-2 py-0.5 rounded-md uppercase">
                  Admin Root
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Full governance over activations, downlines, balance adjustments, and task approvals
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Master Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Action Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Quick Stat Bar */}
      <section className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Unactivated Accounts
            </span>
            <span className="text-2xl font-black font-mono text-amber-400 tabular-nums">
              {unactivatedUsers.length}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Members
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
              {users.length}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Task Submissions
            </span>
            <span className="text-2xl font-black font-mono text-blue-400 tabular-nums">
              {pendingSubmissions.length} Pending
            </span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Pending Withdrawals
            </span>
            <span className="text-2xl font-black font-mono text-purple-400 tabular-nums">
              {pendingWithdrawals.length}
            </span>
          </div>
        </div>
      </section>

      {/* Admin Tab Navigation */}
      <nav className="bg-slate-950 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2">
          {[
            { id: 'activations', label: 'Activation Requests', count: unactivatedUsers.length },
            { id: 'users', label: 'All Users & Downlines', count: users.length },
            { id: 'submissions', label: 'Task Submissions', count: pendingSubmissions.length },
            { id: 'tasks', label: 'Task Catalog (Add/Reduce)', count: tasks.length },
            { id: 'hall_of_fame', label: 'Hall of Fame & Spotlights', count: hallOfFame.length },
            { id: 'withdrawals', label: 'Withdrawal Payouts', count: pendingWithdrawals.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isActive ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Admin Content Viewport */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 my-auto">
        {/* ================= TAB 1: ACTIVATION REQUESTS ================= */}
        {activeTab === 'activations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Account Activation Manager
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Activate ANY user with 1 click, even if they paid from a different phone number or friend's M-Pesa line.
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by username, phone, or code..."
                  className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
                />
              </div>
            </div>

            {/* Quick Note about Different Phone Activation */}
            <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-2xl p-4 text-xs text-emerald-200 flex items-start gap-3">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300">Flexible Activation Mode:</strong> You can activate ANY member account directly using <strong>"Approve & Activate"</strong>. If the user paid Till 8286400 from a friend or relative's different phone number, click <strong>"Activate (Different Phone)"</strong> to attach the payer phone number and confirm activation immediately!
              </div>
            </div>

            {users.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-3xl border border-slate-800 text-slate-500">
                No users found.
              </div>
            ) : (
              <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Names</th>
                        <th className="py-3 px-4">Reg Phone</th>
                        <th className="py-3 px-4">M-Pesa Code</th>
                        <th className="py-3 px-4">Invited By</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Admin Activation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {users
                        .filter(
                          (u) =>
                            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.phone.includes(searchQuery) ||
                            (u.mpesaCode && u.mpesaCode.includes(searchQuery.toUpperCase()))
                        )
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                              @{u.username}
                            </td>
                            <td className="py-3.5 px-4 text-slate-200 font-medium">
                              {u.fullName}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                              {u.phone}
                            </td>
                            <td className="py-3.5 px-4">
                              {u.mpesaCode ? (
                                <span className="font-mono font-bold text-xs bg-slate-800 text-amber-300 px-2 py-1 rounded-md border border-slate-700">
                                  {u.mpesaCode}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500 italic">No code submitted</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                              {u.referrerUsername ? `@${u.referrerUsername}` : 'Direct'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                  u.isActivated
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : u.activationStatus === 'pending'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                    : 'bg-red-950 text-red-400 border border-red-900'
                                }`}
                              >
                                {u.isActivated ? 'Activated' : u.activationStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!u.isActivated ? (
                                  <>
                                    <button
                                      onClick={() => handleDirectApproveActivation(u.id)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-xs transition-colors cursor-pointer"
                                      title="Instant activate"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>Approve & Activate</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setActivateModalUser(u);
                                        setDifferentPayerPhone('');
                                        setCustomMpesaCode(u.mpesaCode || '');
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                                      title="Specify different payer phone or custom code"
                                    >
                                      <Phone className="w-3 h-3 text-amber-400" />
                                      <span>Different Phone</span>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleDeactivateUser(u.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-300 hover:text-white bg-red-950 hover:bg-red-900 rounded-lg border border-red-800 transition-colors cursor-pointer"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Deactivate</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: ALL USERS & DOWNLINES ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  User Management & Downline Trees
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add or deduct earnings, inspect referral downlines per user, and activate any account.
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user, name, phone..."
                  className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              {users
                .filter(
                  (u) =>
                    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.phone.includes(searchQuery)
                )
                .map((u) => {
                  const downlines = getUserDownlines(u.username);
                  const isExpanded = !!expandedUserDownlines[u.id];

                  return (
                    <div
                      key={u.id}
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-base text-emerald-400 font-mono">
                              @{u.username}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                u.isActivated
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {u.isActivated ? 'Active' : 'Unactivated'}
                            </span>
                            {u.referrerUsername && (
                              <span className="text-xs text-slate-400">
                                (Invited by: @{u.referrerUsername})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-300">
                            <strong>{u.fullName}</strong> · Phone: <span className="font-mono">{u.phone}</span>
                            {u.mpesaCode && (
                              <span className="ml-2 text-slate-400">
                                · M-Pesa Code: <strong className="font-mono text-amber-300">{u.mpesaCode}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Balances & Action Buttons */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Available Balance
                            </span>
                            <span className="text-base font-extrabold font-mono text-emerald-400 tabular-nums">
                              KSh {u.availableBalance.toLocaleString()}
                            </span>
                          </div>

                          <div className="text-right pl-3 border-l border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Total Earnings
                            </span>
                            <span className="text-base font-extrabold font-mono text-slate-300 tabular-nums">
                              KSh {u.totalEarnings.toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setBalanceModalUser(u);
                              setBalanceAmount(100);
                              setBalanceAction('add');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs ml-2"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Add / Deduct</span>
                          </button>
                        </div>
                      </div>

                      {/* Downlines Accordion Toggle & Activation Switch */}
                      <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                        <button
                          onClick={() =>
                            setExpandedUserDownlines((prev) => ({
                              ...prev,
                              [u.id]: !prev[u.id],
                            }))
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>
                            View Downlines ({downlines.length} Referred Member{downlines.length === 1 ? '' : 's'})
                          </span>
                        </button>

                        <div className="flex items-center gap-2">
                          {!u.isActivated ? (
                            <button
                              onClick={() => handleDirectApproveActivation(u.id)}
                              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800 cursor-pointer"
                            >
                              Activate Account
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeactivateUser(u.id)}
                              className="text-xs font-bold text-red-400 hover:text-red-300 underline"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Downline Members */}
                      {isExpanded && (
                        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2 mt-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Direct Downlines for @{u.username}:
                          </span>

                          {downlines.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">
                              This user has not invited any downlines yet.
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {downlines.map((dl) => (
                                <div
                                  key={dl.id}
                                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800"
                                >
                                  <div>
                                    <strong className="text-emerald-300">@{dl.username}</strong> ({dl.fullName}) · Phone: <span className="font-mono text-slate-400">{dl.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                        dl.isActivated
                                          ? 'bg-emerald-950 text-emerald-400'
                                          : 'bg-amber-950 text-amber-300'
                                      }`}
                                    >
                                      {dl.isActivated ? 'Active' : 'Pending'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      Registered {new Date(dl.registeredAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: TASK SUBMISSIONS ================= */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Task Submissions Queue
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review blogs, academic essays, translations, and trivia. Approve to credit balance.
                </p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-3xl border border-slate-800 text-slate-500">
                No user submissions submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-md uppercase border border-emerald-800">
                          {sub.taskType}
                        </span>
                        <h4 className="font-bold text-base text-white">
                          {sub.taskTitle}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
                          Reward: KSh {sub.rewardAmount}
                        </span>
                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${
                            sub.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : sub.status === 'pending'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                              : 'bg-red-950 text-red-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                    </div>

                    {/* Submitter Info */}
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span>
                        User: <strong className="text-emerald-400">@{sub.username}</strong>
                      </span>
                      <span>
                        Phone: <strong className="text-slate-200 font-mono">{sub.userPhone}</strong>
                      </span>
                      <span>
                        Submitted: <strong className="text-slate-300">{new Date(sub.submittedAt).toLocaleString()}</strong>
                      </span>
                    </div>

                    {/* Submission Content */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
                      {sub.content}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900">
                      <div className="text-xs text-slate-400">
                        {sub.status === 'approved' && (
                          <span className="text-emerald-400 font-semibold">
                            ✓ Credited KSh {sub.rewardAmount} to user balance
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {sub.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleReviewSubmission(sub.id, false)}
                              className="px-3 py-1.5 text-xs font-bold text-red-300 hover:text-white bg-red-950 hover:bg-red-900 rounded-lg border border-red-800 transition-colors cursor-pointer"
                            >
                              Disapprove
                            </button>
                            <button
                              onClick={() => handleReviewSubmission(sub.id, true, false)}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              Approve (KSh {sub.rewardAmount})
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">
                            Review finalized
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: TASK CATALOG (ADD/REDUCE) ================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Task Catalog & Rewards
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add new tasks or delete outdated ones from user view.
                </p>
              </div>

              <button
                onClick={() => setIsAddTaskOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Task</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold bg-slate-900 text-emerald-400 px-2 py-0.5 rounded-md uppercase border border-slate-800">
                        {task.type}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Reward: KSh {task.reward}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-white">{task.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                      {task.description}
                    </p>

                    {task.sourceText && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg text-xs font-mono text-slate-300 mt-2 border border-slate-800">
                        <strong className="text-slate-400">Source:</strong> {task.sourceText}
                      </div>
                    )}
                    {task.question && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg text-xs font-mono text-slate-300 mt-2 border border-slate-800">
                        <strong className="text-slate-400">Q:</strong> {task.question}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex justify-end">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Task</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: HALL OF FAME ================= */}
        {activeTab === 'hall_of_fame' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Hall of Fame Management
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add or remove members from the public Hall of Fame.
                </p>
              </div>

              <button
                onClick={() => setIsAddHofOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member to Hall of Fame</span>
              </button>
            </div>

            {/* Hall of Fame Members List */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50">
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Achievement Title</th>
                      <th className="py-3 px-4">Awarded</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {hallOfFame.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {entry.userName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-amber-300">
                          {entry.userPhone}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">
                          {entry.achievementTitle}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-emerald-400">
                          KSh {entry.amountCredited}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {entry.date}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleRemoveHof(entry.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: WITHDRAWALS ================= */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Withdrawal Payout Requests
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorize M-Pesa disbursements (Minimum KSh 300).
                </p>
              </div>
            </div>

            {withdrawals.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-3xl border border-slate-800 text-slate-500">
                No withdrawal requests at this moment.
              </div>
            ) : (
              <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">M-Pesa Phone</th>
                        <th className="py-3 px-4">Amount Requested</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                            @{w.username}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-200">
                            {w.phone}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-sm text-amber-300">
                            KSh {w.amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400">
                            {new Date(w.requestedAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                w.status === 'approved'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : w.status === 'pending'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                  : 'bg-red-950 text-red-400'
                              }`}
                            >
                              {w.status === 'approved' ? 'Paid / Approved' : w.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {w.status === 'pending' && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleReviewWithdrawal(w.id, false)}
                                  className="px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-950 rounded-lg border border-red-900 cursor-pointer"
                                >
                                  Reject / Refund
                                </button>
                                <button
                                  onClick={() => handleReviewWithdrawal(w.id, true)}
                                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-xs cursor-pointer"
                                >
                                  Mark as Paid
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= MODAL: CUSTOM DIFFERENT PHONE ACTIVATION ================= */}
      {activateModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-700 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Activate @{activateModalUser.username}
                </h3>
                <p className="text-xs text-slate-400">
                  Registered Phone: <span className="font-mono text-slate-200">{activateModalUser.phone}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleCustomPhoneActivation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Payer Phone (If different from registered phone)
                </label>
                <input
                  type="text"
                  value={differentPayerPhone}
                  onChange={(e) => setDifferentPayerPhone(e.target.value)}
                  placeholder="e.g. 0722000000 (friend or relative phone)"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Activate account even if payment came from another number.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  M-Pesa Transaction Code
                </label>
                <input
                  type="text"
                  value={customMpesaCode}
                  onChange={(e) => setCustomMpesaCode(e.target.value.toUpperCase())}
                  placeholder="e.g. QK891048XA or leave as is"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActivateModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm & Activate Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / DEDUCT BALANCE ================= */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              Adjust Balance for @{balanceModalUser.username}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Current available balance: <strong className="text-emerald-400 font-mono">KSh {balanceModalUser.availableBalance}</strong>
            </p>

            <form onSubmit={handleApplyBalance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Action
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceAction('add')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      balanceAction === 'add'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    + Add Earnings
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAction('deduct')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      balanceAction === 'deduct'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    - Deduct Earnings
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Amount (KSh)
                </label>
                <input
                  type="number"
                  min={1}
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Reason / Memo
                </label>
                <input
                  type="text"
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  placeholder="e.g. Special bonus / task correction"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD TASK ================= */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">
              Add New Task to Platform
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Create a new blog, translation, or trivia question for members.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Task Category
                </label>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="blog">Blog Reading / Review</option>
                  <option value="academic">Academic Writing</option>
                  <option value="translation">Translation Task</option>
                  <option value="trivia">Trivia Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Instructions for members..."
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Award Amount (KSh)
                </label>
                <input
                  type="number"
                  min={1}
                  value={newTaskReward}
                  onChange={(e) => setNewTaskReward(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white"
                />
              </div>

              {newTaskType === 'translation' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Source Text
                    </label>
                    <textarea
                      rows={2}
                      value={newTaskExtra1}
                      onChange={(e) => setNewTaskExtra1(e.target.value)}
                      placeholder="Sentence or paragraph to translate..."
                      required
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Target Language
                    </label>
                    <input
                      type="text"
                      value={newTaskExtra2}
                      onChange={(e) => setNewTaskExtra2(e.target.value)}
                      placeholder="e.g. Kiswahili or English"
                      required
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                    />
                  </div>
                </>
              )}

              {newTaskType === 'trivia' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Question Text
                    </label>
                    <input
                      type="text"
                      value={newTaskExtra1}
                      onChange={(e) => setNewTaskExtra1(e.target.value)}
                      placeholder="What is...?"
                      required
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newTaskExtra2}
                      onChange={(e) => setNewTaskExtra2(e.target.value)}
                      placeholder="e.g. Option A, Option B, Option C, Option D"
                      required
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs cursor-pointer"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD TO HALL OF FAME ================= */}
      {isAddHofOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              Add Member to Hall of Fame
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Recognize an outstanding blog or academic submission author publicly.
            </p>

            <form onSubmit={handleAddHof} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Member Name *
                </label>
                <input
                  type="text"
                  value={hofName}
                  onChange={(e) => setHofName(e.target.value)}
                  placeholder="e.g. Brian Omondi"
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={hofPhone}
                  onChange={(e) => setHofPhone(e.target.value)}
                  placeholder="e.g. 0712***789"
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Amount Credited (KSh)
                </label>
                <input
                  type="number"
                  min={1}
                  value={hofAmount}
                  onChange={(e) => setHofAmount(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Achievement / Topic Title *
                </label>
                <input
                  type="text"
                  value={hofTitle}
                  onChange={(e) => setHofTitle(e.target.value)}
                  placeholder="e.g. Academic Blog: Agritech Logistics"
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Congratulations Message
                </label>
                <textarea
                  rows={2}
                  value={hofMessage}
                  onChange={(e) => setHofMessage(e.target.value)}
                  placeholder="Custom congratulations and reach-out notice..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddHofOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs cursor-pointer"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        MegaQash Master Console · Password Protected: <span className="font-mono">Admin200</span> · Lipa na M-Pesa Till: <span className="font-mono">8286400</span>
      </footer>
    </div>
  );
};
