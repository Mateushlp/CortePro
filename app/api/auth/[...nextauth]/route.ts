/* eslint-disable no-unused-vars */
import { db } from "@/app/_lib/prisma"
import NextAuth, { type DefaultSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id?: string | null
    }
  }
}

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // ⚠️ essencial para produção
  session: {
    strategy: "jwt", // Recomendado para App Router
  },
  pages: {
    signIn: "/auth/signin", // Opcional: customizar página de login
  },
  callbacks: {
    async session({ session, token }) {
      // Adiciona ID do usuário na session
      if (session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
