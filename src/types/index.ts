export interface Profile {
  Name: string;
  Title: string;
  Tagline: string;
  ProfileImageURL: string;
  LandingBackgroundURL: string;
  Phone: string;
  Email: string;
  Bio: string;
  LinkedIn_URL: string;
  Facebook_URL: string;
  Instagram_URL: string;
  X_URL: string;
  Threads_URL: string;
  WhatsApp_URL: string;
  Show_LinkedIn: boolean;
  Show_Facebook: boolean;
  Show_Instagram: boolean;
  Show_X: boolean;
  Show_Threads: boolean;
  Show_WhatsApp: boolean;
  CV_File_URL: string;
  CV_File_Name: string;
}

export interface Post {
  ID: string;
  Timestamp: string;
  TextContent: string;
  ImageURLs: string[];
  VideoURLs: string[];
  ThumbnailURL?: string;
}

export interface Skill {
  ID: string;
  Order: number;
  Title: string;
  Description: string;
  IconURL?: string;
  Visible: boolean;
}

export interface Project {
  ID: string;
  Order: number;
  Title: string;
  Description: string;
  Category: string;
  ImageURL?: string;
  StartDate: string;
  EndDate: string;
  Visible: boolean;
}

export interface ContactSubmission {
  ID: string;
  Timestamp: string;
  SenderName: string;
  SenderEmail: string;
  Message: string;
  EmailSent: boolean;
}

export type Theme = 'light' | 'dark';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}
