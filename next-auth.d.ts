// types/next-auth.d.ts
import NextAuth from "next-auth";
import { Role, KYCStatus } from "@prisma/client";

declare module "next-auth" {
  interface User {
    isVerified?: boolean;
    userId?: string;
    role?: Role;
    kycStatus?: KYCStatus;
  }

  interface Session {
    accessToken?: string; // Add accessToken to session
    userId?: string; // Optional userId, if you plan to add it
    user?: User & {
      userId?: string;
      isVerified?: boolean;
      role?: Role;
      kycStatus?: KYCStatus;
      name?: string;
      email: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string; // Add accessToken to JWT
    userId?: string; // Optional userId
    isVerified?: boolean;
    role?: Role;
    kycStatus?: KYCStatus;
  }
}
