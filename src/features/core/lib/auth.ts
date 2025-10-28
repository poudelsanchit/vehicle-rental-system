// lib/auth.ts (or auth/config.ts)
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { kyc: true }, // Include KYC data
        });

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          name: user.username,
          email: user.email,
          isVerified: user.isVerified,
          kycStatus: user.kyc?.status, // Add KYC status
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: { kyc: true }, // Include KYC data
        });

        if (!dbUser) {
          // User doesn't exist in DB, return empty token to log them out
          return {};
        }

        token.userId = dbUser.id.toString();
        token.isVerified = dbUser.isVerified;
        token.role = dbUser.role;
        token.kycStatus = dbUser.kyc?.status; // Add KYC status to token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.isVerified = token.isVerified;
        session.user.role = token.role;
        session.user.kycStatus = token.kycStatus; // Add KYC status to session
      }
      return session;
    },
  },
};