export type Role = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  interests: string[];
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  owner: string | { _id: string; name: string; email: string };
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  body: string;
  author: { _id: string; name: string };
  createdAt: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paged<T> {
  data: T[];
  meta: Meta;
}

export interface InterestGroup {
  interest: string;
  count: number;
  users: { _id: string; name: string }[];
}

export interface UserPostsResponse {
  user: {
    _id: string;
    name: string;
    interests: string[];
    posts: Omit<Post, 'author'>[];
  };
  meta: Meta;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  interests: string[];
}

export interface NoteInput {
  title: string;
  content: string;
}

export interface PostInput {
  title: string;
  body: string;
}

export interface AdminUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  interests: string[];
}