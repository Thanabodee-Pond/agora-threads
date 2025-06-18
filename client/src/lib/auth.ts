import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

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
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;

        try {
          const res = await axios.post<BackendLoginResponse>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
            { username: credentials.username }
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
          const errorMessage = axios.isAxiosError(e)
            ? e.response?.data?.message || 'Invalid credentials.'
            : 'An error occurred during sign in.';

          console.error("Authorize Error:", errorMessage);
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
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