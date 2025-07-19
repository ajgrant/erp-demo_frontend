import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Extend the User type to include jwt
declare module "next-auth" {
  interface User {
    jwt?: string;
    firstName?: string;
    lastName?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Strapi",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identifier: credentials?.email,
              password: credentials?.password,
            }),
          }
        );
        const user = await res.json();
        if (!res.ok || !user.jwt) {
          throw new Error(user.error?.message || "Login failed");
        }
        return {
          id: user.user.id,
          email: user.user.email,
          name: user.user.username,
          firstName: user.user.firstName,
          lastName: user.user.lastName,
          jwt: user.jwt,
          avatar: "/avatars/shadcn.jpg",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.jwt = user.jwt;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.jwt = token.jwt as string;
      session.user.avatar = token.avatar as string;
      session.user.firstName = token.firstName as string;
      session.user.lastName = token.lastName as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
});
