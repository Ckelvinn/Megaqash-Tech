import React, { useState } from 'react';
import {
  HelpCircle,
  Award,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { User, TaskItem, TaskSubmission } from '../types';
import { submitUserTask } from '../services/storage';

interface TriviaViewProps {
  user: User;
  tasks: TaskItem[];
  submissions: TaskSubmission[];
  onRefreshData: () => void;
  onBackToDashboard: () => void;
}

export const TriviaView: React.FC<TriviaViewProps> = ({
  user,
  tasks,
  submissions,
  onRefreshData,
  onBackToDashboard,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, { text: string; isError: boolean }>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const triviaTasks = tasks.filter((t) => t.type === 'trivia');

  const handleSelectOption = (taskId: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [taskId]: option }));
  };

  const handleSubmit = (task: TaskItem) => {
    const answer = selectedAnswers[task.id];
    if (!answer) {
      setMessages((prev) => ({
        ...prev,
        [task.id]: { text: 'Please select an answer option before submitting.', isError: true },
      }));
      return;
    }

    setSubmittingId(task.id);
    const res = submitUserTask({
      taskId: task.id,
      taskType: 'trivia',
      taskTitle: task.title,
      userId: user.id,
      username: user.username,
      userPhone: user.phone,
      content: `Selected Answer: ${answer}`,
      selectedOption: answer,
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
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span>Daily Knowledge Challenges</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daily Trivia Tasks
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Answer the 3 trivia questions below. Each correctly submitted trivia rewards <strong className="text-emerald-800">KSh 5</strong> into your balance. Each shows <strong>Pending</strong> until the Admin approves!
          </p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 text-right shrink-0">
          <span className="text-xs font-semibold text-emerald-800 block uppercase">Reward per Question</span>
          <span className="text-2xl font-black font-mono text-emerald-950 tabular-nums">KSh 5</span>
        </div>
      </div>

      {/* 3 Trivia Questions */}
      <div className="space-y-4">
        {triviaTasks.map((task, idx) => {
          const userSub = submissions.find((s) => s.taskId === task.id && s.userId === user.id);
          const currentSelection = selectedAnswers[task.id];
          const msg = messages[task.id];

          return (
            <div
              key={task.id}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-emerald-200/80 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    Q{idx + 1}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">
                    {task.title}
                  </h3>
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

              {/* Question Text */}
              <div className="text-base font-semibold text-slate-900 leading-snug">
                {task.question}
              </div>

              {/* Options or Existing Submission */}
              {userSub ? (
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Your Submitted Answer:
                  </span>
                  <div className="inline-block px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-emerald-900">
                    {userSub.selectedOption || userSub.content}
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                    <span>Submitted on {new Date(userSub.submittedAt).toLocaleTimeString()}</span>
                    {userSub.status === 'pending' && (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending Admin Verification
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {task.options?.map((option, optIdx) => {
                      const isSelected = currentSelection === option;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(task.id, option)}
                          className={`p-3.5 rounded-xl border text-left text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-600/30'
                              : 'bg-slate-50 hover:bg-emerald-50/70 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span>{option}</span>
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-mono ${
                              isSelected
                                ? 'border-white bg-emerald-900 text-white'
                                : 'border-slate-300 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                        </button>
                      );
                    })}
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
                      disabled={submittingId === task.id || !currentSelection}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Trivia Answer (KSh 5)</span>
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
