import NextAuth, { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

// type Backend response 
interface BackendUser {
  id: string;
  username: string;
}

interface BackendLoginResponse {
  user: BackendUser;
  accessToken: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post<BackendLoginResponse>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              username: credentials?.username,
              password: credentials?.password,
            }
          );

          const backendResponse = res.data;

          if (backendResponse.user && backendResponse.accessToken) {
            return {
              id: backendResponse.user.id.toString(),
              name: backendResponse.user.username,
              username: backendResponse.user.username,
              accessToken: backendResponse.accessToken,
            };
          }
          return null;
        } catch (e: unknown) { 
          let errorMessage = 'An error occurred during sign in.';
          // ตรวจสอบชนิดของ error 
          if (axios.isAxiosError(e)) {
            errorMessage = e.response?.data?.message || 'Invalid credentials.';
          } else if (e instanceof Error) {
            errorMessage = e.message;
          }
          console.error("Login Error from NestJS:", errorMessage);
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username; 
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };