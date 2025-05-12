import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { validateCredentials } from "@/app/lib/userUtils";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form
      name: "Email & Password",
      // The credentials is used to generate a suitable form on the sign in page.
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        console.log("Attempting to authorize:", credentials.email);
        const user = validateCredentials(
          credentials.email,
          credentials.password
        );

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          console.log("User authorized successfully:", user.email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          console.log("Authorization failed for:", credentials.email);
          return null;
        }
      },
    }),
  ],
  secret:
    process.env.NEXTAUTH_SECRET || "your-fallback-secret-key-for-dev-only",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  debug: true, // Enable debug mode for NextAuth
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
