import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        if (account?.provider !== "google") {
          return false;
        }

        // Verifica se o usuário existe e está ativo
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // Se o usuário não existe no banco, bloqueia o acesso
        if (!dbUser) {
          console.log(`Acesso negado: usuário ${user.email} não cadastrado`);
          return false;
        }

        // Se existe mas não está ativo, bloqueia
        if (!dbUser.isActive) {
          console.log(`Acesso negado: usuário ${user.email} está inativo`);
          return false;
        }

        console.log(`Acesso autorizado: ${user.email}`);
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // Primeira vez que o usuário faz login
      if (account && user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, isActive: true },
        });
        
        return {
          ...token,
          userId: dbUser?.id,
          isActive: dbUser?.isActive,
        };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};