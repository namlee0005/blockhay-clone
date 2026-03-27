import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import type { UserRole } from "@/models/User";

// Augment NextAuth types with role field
declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: {
      role?: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase() })
          .select("_id name email passwordHash role")
          .lean<{
            _id: unknown;
            name: string;
            email: string;
            passwordHash?: string;
            role: UserRole;
          }>();

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // Persist role into the JWT on first sign-in
      if (user?.role) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
});
