import React, { useState } from 'react';
import {
  Languages,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { User, TaskItem, TaskSubmission } from '../types';
import { submitUserTask } from '../services/storage';

interface TranslationTasksViewProps {
  user: User;
  tasks: TaskItem[];
  submissions: TaskSubmission[];
  onRefreshData: () => void;
  onBackToDashboard: () => void;
}

export const TranslationTasksView: React.FC<TranslationTasksViewProps> = ({
  user,
  tasks,
  submissions,
  onRefreshData,
  onBackToDashboard,
}) => {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, { text: string; isError: boolean }>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const translationTasks = tasks.filter((t) => t.type === 'translation');

  const handleInputChange = (taskId: string, val: string) => {
    setTranslations((prev) => ({ ...prev, [taskId]: val }));
  };

  const handleSubmit = (task: TaskItem) => {
    const text = translations[task.id];
    if (!text || !text.trim()) {
      setMessages((prev) => ({
        ...prev,
        [task.id]: { text: 'Please enter your translation before submitting.', isError: true },
      }));
      return;
    }

    setSubmittingId(task.id);
    const res = submitUserTask({
      taskId: task.id,
      taskType: 'translation',
      taskTitle: task.title,
      userId: user.id,
      username: user.username,
      userPhone: user.phone,
      content: text.trim(),
      rewardAmount: task.reward,
    });
    setSubmittingId(null);

    if (res.success) {
      setMessages((prev) => ({
        ...prev,
        [task.id]: { text: res.message, isError: false },
      }));
      onRefreshData();
    } else {
      setMessages((prev) => ({
        ...prev,
        [task.id]: { text: res.message, isError: true },
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with X button */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <button
          onClick={onBackToDashboard}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pr-12 md:pr-0">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Languages className="w-4 h-4 text-emerald-700" />
            <span>Linguistic & Localization Queue</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            5 Translation Tasks
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Complete the 5 translation exercises below. Each approved translation rewards <strong className="text-emerald-800">KSh 5</strong> directly into your account balance. Once submitted, each shows <strong>Pending</strong> until the Admin approves!
          </p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 text-right shrink-0">
          <span className="text-xs font-semibold text-emerald-800 block uppercase">Reward per Task</span>
          <span className="text-2xl font-black font-mono text-emerald-950 tabular-nums">KSh 5</span>
        </div>
      </div>

      {/* 5 Translation Cards */}
      <div className="space-y-4">
        {translationTasks.map((task, index) => {
          const userSub = submissions.find((s) => s.taskId === task.id && s.userId === user.id);
          const msg = messages[task.id];

          return (
            <div
              key={task.id}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-emerald-200/80 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-emerald-800">{task.sourceLanguage}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-teal-800">{task.targetLanguage}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
                    +KSh {task.reward}
                  </span>
                  {userSub && (
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${
                        userSub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : userSub.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {userSub.status === 'pending' ? 'Pending Admin Approval' : userSub.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Source Text Box */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Original Source Text:
                </span>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 font-medium">
                  {task.sourceText}
                </div>
              </div>

              {/* Submission Area or Existing Submission */}
              {userSub ? (
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Your Submitted Translation:
                  </span>
                  <p className="text-sm text-slate-800 italic font-medium">
                    "{userSub.content}"
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                    <span>Submitted on {new Date(userSub.submittedAt).toLocaleTimeString()}</span>
                    {userSub.status === 'pending' && (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Awaiting Admin Review
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                      Your Translation in {task.targetLanguage} *
                    </label>
                    <textarea
                      rows={3}
                      value={translations[task.id] || ''}
                      onChange={(e) => handleInputChange(task.id, e.target.value)}
                      placeholder={`Enter accurate ${task.targetLanguage} translation here...`}
                      className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>

                  {msg && (
                    <div
                      className={`flex items-center gap-2 p-3 text-xs font-medium rounded-xl border ${
                        msg.isError
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {msg.isError ? (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      )}
                      <span>{msg.text}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSubmit(task)}
                      disabled={submittingId === task.id}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Translation (KSh 5)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
