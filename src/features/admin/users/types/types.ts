export interface IUser {
  id: string;
  username: string;
  role: "ADMIN" | "OWNER" | "USER";
  email: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface IUserUpdate {
  id: string;
  isVerified: boolean;
  role: "ADMIN" | "OWNER" | "USER";
}
