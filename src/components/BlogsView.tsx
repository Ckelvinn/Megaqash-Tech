import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Send,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';
import { User, TaskItem, TaskSubmission } from '../types';
import { submitUserTask } from '../services/storage';

interface BlogsViewProps {
  user: User;
  blogs: TaskItem[];
  submissions: TaskSubmission[];
  onRefreshData: () => void;
  onBackToDashboard: () => void;
}

export const BlogsView: React.FC<BlogsViewProps> = ({
  user,
  blogs,
  submissions,
  onRefreshData,
  onBackToDashboard,
}) => {
  const [activeBlogId, setActiveBlogId] = useState<string | null>(blogs[0]?.id || null);
  const [submissionText, setSubmissionText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeBlog = blogs.find((b) => b.id === activeBlogId) || blogs[0];

  // Check if current user has submission for this blog
  const userSubmission = submissions.find(
    (s) => s.taskId === activeBlog?.id && s.userId === user.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim()) {
      setStatusMsg({ text: 'Please write your blog review / summary before submitting.', isError: true });
      return;
    }

    if (!activeBlog) return;

    setIsSubmitting(true);
    setStatusMsg(null);

    const res = submitUserTask({
      taskId: activeBlog.id,
      taskType: 'blog',
      taskTitle: activeBlog.title,
      userId: user.id,
      username: user.username,
      userPhone: user.phone,
      content: submissionText.trim(),
      rewardAmount: activeBlog.reward,
    });

    setIsSubmitting(false);

    if (res.success) {
      setStatusMsg({ text: res.message, isError: false });
      setSubmissionText('');
      onRefreshData();
    } else {
      setStatusMsg({ text: res.message, isError: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with X Close Button to return to dashboard */}
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
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>Curated Reading & Review Tasks</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Read & Review Blogs
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Choose any of the 3 featured professional publications below. Read through the key concepts, submit your analytical takeaway or review, and receive <strong className="text-emerald-800">KSh 100</strong> directly to your balance upon Admin verification!
          </p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 text-right shrink-0">
          <span className="text-xs font-semibold text-emerald-800 block uppercase">Reward per Blog</span>
          <span className="text-2xl font-black font-mono text-emerald-950 tabular-nums">KSh 100</span>
        </div>
      </div>

      {/* Blog Selector Tabs (3 Blogs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {blogs.map((blog, idx) => {
          const sub = submissions.find((s) => s.taskId === blog.id && s.userId === user.id);
          const isSelected = blog.id === activeBlogId;

          return (
            <button
              key={blog.id}
              onClick={() => {
                setActiveBlogId(blog.id);
                setStatusMsg(null);
                setSubmissionText('');
              }}
              className={`text-left p-5 rounded-2xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-md border-emerald-900 ring-2 ring-emerald-600/30'
                  : 'bg-white hover:bg-emerald-50/60 text-slate-900 border-emerald-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-extrabold uppercase tracking-wider ${
                    isSelected ? 'text-emerald-200' : 'text-emerald-700'
                  }`}
                >
                  Blog 0{idx + 1}
                </span>
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  KSh {blog.reward}
                </span>
              </div>

              <h4 className="font-bold text-sm leading-snug line-clamp-2 mb-2">
                {blog.title}
              </h4>

              <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-100/20">
                <span className={isSelected ? 'text-emerald-200' : 'text-slate-500'}>
                  {blog.readingTimeMinutes} min read
                </span>
                {sub && (
                  <span
                    className={`font-semibold capitalize text-xs ${
                      sub.status === 'approved'
                        ? isSelected
                          ? 'text-emerald-300'
                          : 'text-emerald-700'
                        : sub.status === 'pending'
                        ? isSelected
                          ? 'text-amber-200'
                          : 'text-amber-700'
                        : 'text-red-500'
                    }`}
                  >
                    • {sub.status}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Blog Workspace & Submission Form */}
      {activeBlog && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200/80 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Active Selection
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-500">
                Reward: KSh {activeBlog.reward}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeBlog.title}
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">
              {activeBlog.description}
            </p>
          </div>

          {/* Key Topics / Outline */}
          {activeBlog.blogOutline && activeBlog.blogOutline.length > 0 && (
            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Core Discussion Topics Covered in this Blog:</span>
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {activeBlog.blogOutline.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Status of Existing Submission or Form */}
          {userSubmission ? (
            <div className="rounded-2xl p-5 border space-y-3 bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Your Submission Status:
                  </span>
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${
                      userSubmission.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : userSubmission.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {userSubmission.status === 'pending' ? 'Pending Admin Approval' : userSubmission.status}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {new Date(userSubmission.submittedAt).toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap font-medium">
                {userSubmission.content}
              </div>

              {userSubmission.status === 'pending' && (
                <p className="text-xs text-amber-800 font-medium">
                  ⏳ Your review has been submitted and is currently <strong>Pending Admin Approval</strong>. Once the admin reviews and approves your submission, your account will be credited with <strong>KSh {activeBlog.reward}</strong>.
                </p>
              )}

              {userSubmission.status === 'approved' && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Approved! KSh {activeBlog.reward} has been credited to your available balance.</span>
                </div>
              )}
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  Write Your Summary / Takeaway Review *
                </label>
                <textarea
                  rows={5}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Summarize the core takeaways from this blog in 3-5 sentences. Explain how freelancers can apply these principles to generate reliable earnings..."
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {statusMsg && (
                <div
                  className={`flex items-center gap-2 p-3 text-xs font-medium rounded-xl border ${
                    statusMsg.isError
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {statusMsg.isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-mono">
                  Word count: {submissionText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Blog Review (Earn KSh 100)</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
