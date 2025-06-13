// File: client/src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
      },
      async authorize(credentials) {
        try {
          // ยิง API ไปที่ NestJS Backend Endpoint /auth/register
          // เพราะมันรองรับทั้งการสร้าง user ใหม่และ login user เก่า
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            username: credentials?.username,
          });

          const user = res.data; // { access_token: '...' }

          if (user && user.access_token) {
            // Return object ที่มีข้อมูล token เพื่อส่งต่อให้ callback
            // NextAuth จะใช้ข้อมูล name และ id ในการสร้าง session.user
            return {
              id: credentials?.username || 'user',
              name: credentials?.username,
              accessToken: user.access_token,
            };
          }
          return null;
        } catch (e: any) {
          const errorMessage = e.response?.data?.message || 'An error occurred during sign in.';
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
      // user object มาจาก authorize function
      if (user) {
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // ส่งข้อมูลจาก token ไปที่ session object
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };