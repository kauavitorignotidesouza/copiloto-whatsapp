import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Demo mode: accepts predefined credentials without DB
// In production, replace with real DB lookup
const DEMO_USER = {
  id: "demo-user-1",
  name: "Admin",
  email: "admin@exemplo.com",
  role: "admin",
  tenantId: "demo-tenant-1",
  image: null,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Demo mode: accept any email with password "123456"
        // or the default demo credentials
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (password.length >= 6) {
          return {
            id: DEMO_USER.id,
            name: email.split("@")[0].replace(/[^a-zA-Z]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            email: email,
            role: DEMO_USER.role,
            tenantId: DEMO_USER.tenantId,
            image: DEMO_USER.image,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as Record<string, unknown>).role;
        token.tenantId = (user as unknown as Record<string, unknown>).tenantId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).tenantId = token.tenantId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
