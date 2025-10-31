import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Include email provider ONLY when server env is configured
    ...(process.env.DISABLE_EMAIL_SIGNIN === "1"
      ? []
      : process.env.EMAIL_SERVER_HOST
      ? [
          EmailProvider({
            server: {
              host: process.env.EMAIL_SERVER_HOST,
              port: Number(process.env.EMAIL_SERVER_PORT),
              auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
              },
            },
            from: process.env.EMAIL_FROM,
          }),
        ]
      : []),
    // Dev-only credentials provider to bypass email during local testing
    ...(process.env.NODE_ENV !== "production"
      ? [
          CredentialsProvider({
            name: "Dev Sign In",
            credentials: {
              email: { label: "Email", type: "text" },
            },
            async authorize(credentials) {
              const email = (credentials?.email || "").toString().trim();
              if (!email) return null;
              const user = await db.user.upsert({
                where: { email },
                update: {},
                create: {
                  email,
                  emailVerified: new Date(),
                  // @ts-ignore - role exists in our schema
                  role: "ADMIN",
                },
              });
              return { id: user.id, email: user.email, name: user.name || undefined } as any;
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // @ts-ignore - role is on our User model
        session.user.role = user.role;
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
};
