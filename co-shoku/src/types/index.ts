export type User = {
  id: string;
  nickname: string;
  email: string;
  createdAt: string;
};

export type Post = {
  id: string;
  userId: string;
  imageUri?: string;
  category: string;
  parentCategory: string;
  postedAt: string;
  expiresAt: string;
};

export type FoodHistory = {
  id: string;
  userId: string;
  category: string;
  parentCategory: string;
  postedAt: string;
};

export type Report = {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reason?: string;
  createdAt: string;
};

export type CallMatch = {
  partnerCategory: string;
};
