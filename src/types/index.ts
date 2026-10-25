export type UserRole = 'user' | 'admin';

export type ActivationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  password: string;
  role: UserRole;
  isActivated: boolean;
  activationStatus: ActivationStatus;
  mpesaCode?: string;
  activationSubmittedAt?: string;
  availableBalance: number;
  totalEarnings: number;
  referrerUsername?: string;
  registeredAt: string;
  referralBonusEarned?: number;
}

export type TaskType = 'blog' | 'academic' | 'translation' | 'trivia';

export interface TaskItem {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  reward: number; // KSh
  // for blogs
  blogOutline?: string[];
  readingTimeMinutes?: number;
  // for translation
  sourceText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  // for trivia
  question?: string;
  category?: string;
  options?: string[];
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  taskType: TaskType;
  taskTitle: string;
  userId: string;
  username: string;
  userPhone: string;
  content: string;
  selectedOption?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rewardAmount: number;
  adminFeedback?: string;
  publishedToSpotlight?: boolean;
}

export interface HallOfFameEntry {
  id: string;
  userName: string;
  userPhone: string;
  amountCredited: number;
  achievementTitle: string;
  congratsMessage: string;
  date: string;
  category: 'blog' | 'academic' | 'admin_added';
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  phone: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
}

export interface PublishedSpotlight {
  id: string;
  userName: string;
  userPhone: string;
  taskTitle: string;
  amountAwarded: number;
  congratsMessage: string;
  excerpt: string;
  publishedAt: string;
}
