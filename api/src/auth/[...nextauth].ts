import NextAuth, { NextAuthOptions, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

interface BackendLoginResponse {
  user: {
    id: string;
    username: string;
  };
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
            },
          );

          const backendResponse = res.data;

          if (backendResponse?.user && backendResponse?.accessToken) {
            return {
              id: backendResponse.user.id,
              username: backendResponse.user.username,
              accessToken: backendResponse.accessToken,
              name: backendResponse.user.username, 
              email: null, 
            };
          } else {
            return null;
          }
        } catch (e: unknown) { 
          let errorMessage = 'Invalid credentials';
          if (axios.isAxiosError(e) && e.response?.data?.message) {
            errorMessage = String(e.response.data.message);
          } else if (e instanceof Error) {
            errorMessage = e.message;
          }
          console.error('Login Error:', errorMessage);
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        const extendedUser = user as any; 
        token.id = extendedUser.id;
        token.username = extendedUser.username;
        token.accessToken = extendedUser.accessToken;
      }
      return token;
    },
    session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        session.accessToken = token.accessToken;
        if (session.user) {
          session.user.id = token.id;
          session.user.name = token.username;
          session.user.username = token.username;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};

export default NextAuth(authOptions);