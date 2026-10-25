import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Send,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';
import { User, TaskSubmission } from '../types';
import { submitUserTask } from '../services/storage';

interface AcademicWritingViewProps {
  user: User;
  submissions: TaskSubmission[];
  onRefreshData: () => void;
  onBackToDashboard: () => void;
}

export const AcademicWritingView: React.FC<AcademicWritingViewProps> = ({
  user,
  submissions,
  onRefreshData,
  onBackToDashboard,
}) => {
  const [blogTitle, setBlogTitle] = useState('');
  const [category, setCategory] = useState('Technology & Business');
  const [content, setContent] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User's academic submissions
  const userAcademicSubs = submissions.filter(
    (s) => s.taskType === 'academic' && s.userId === user.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) {
      setStatusMsg({ text: 'Please provide a title for your blog or research essay.', isError: true });
      return;
    }

    if (content.trim().length < 60) {
      setStatusMsg({
        text: 'Your academic writing piece should be substantive (at least 60 characters).',
        isError: true,
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    const fullSubmissionContent = `[Category: ${category}]\n[Title: ${blogTitle.trim()}]\n\n${content.trim()}`;

    const res = submitUserTask({
      taskId: 'academic-1',
      taskType: 'academic',
      taskTitle: `Academic Blog: ${blogTitle.trim()}`,
      userId: user.id,
      username: user.username,
      userPhone: user.phone,
      content: fullSubmissionContent,
      rewardAmount: 100,
    });

    setIsSubmitting(false);

    if (res.success) {
      setStatusMsg({ text: res.message, isError: false });
      setBlogTitle('');
      setContent('');
      onRefreshData();
    } else {
      setStatusMsg({ text: res.message, isError: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with X button */}
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
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span>Academic & Original Research Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Writing Task
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Write an original blog or analytical article of your choice (Economics, Agritech, Computing, Renewable Energy, or Local Trade). If approved by the Admin, you will get paid <strong className="text-emerald-800 font-bold">KSh 100</strong> and your work will be featured on the Transparency Hall of Fame!
          </p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 text-right shrink-0">
          <span className="text-xs font-semibold text-emerald-800 block uppercase">Approved Bounty</span>
          <span className="text-2xl font-black font-mono text-emerald-950 tabular-nums">KSh 100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submission Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200/80 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-700" />
              <span>Submit Your Original Blog</span>
            </h3>

            {statusMsg && (
              <div
                className={`flex items-center gap-2 p-3.5 text-xs font-medium rounded-xl border ${
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Blog Title / Topic *
                </label>
                <input
                  type="text"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. Impact of Mobile Micro-Insurance on Kenyan Farmers"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Academic Subject Discipline *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                >
                  <option value="Technology & Business">Technology & Business</option>
                  <option value="Economics & Finance">Economics & Finance</option>
                  <option value="Agriculture & Food Security">Agriculture & Food Security</option>
                  <option value="Health Sciences & Nutrition">Health Sciences & Nutrition</option>
                  <option value="Environmental Science & Energy">Environmental Science & Energy</option>
                  <option value="Education & Digital Skills">Education & Digital Skills</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Essay / Blog Content *
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Draft your essay or article here. Include an introduction, 2-3 body arguments with practical examples, and a conclusion..."
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 font-mono">
                  {content.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Academic Blog (KSh 100)</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Submission History & Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-200/80">
            <h4 className="text-base font-bold text-slate-900 tracking-tight mb-3 flex items-center justify-between">
              <span>Your Academic Submissions</span>
              <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md font-semibold">
                {userAcademicSubs.length} Total
              </span>
            </h4>

            {userAcademicSubs.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No academic submissions yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Submit your first article on the left to earn KSh 100!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userAcademicSubs.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sub.status === 'pending' ? 'Pending Admin Approval' : sub.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-800">
                        KSh {sub.rewardAmount}
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-slate-900 leading-snug">
                      {sub.taskTitle}
                    </h5>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {sub.content}
                    </p>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                      Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
