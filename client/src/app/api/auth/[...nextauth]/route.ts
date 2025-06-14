// File: client/src/app/api/auth/[...nextauth]/route.ts

// [แก้ไข 1] เปลี่ยน AuthOptions เป็น NextAuthOptions และ import Type ที่ต้องใช้เพิ่ม
import NextAuth, { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

// กำหนด type สำหรับ Backend response ให้ชัดเจน
interface BackendUser {
  id: string;
  username: string;
}

interface BackendLoginResponse {
  user: BackendUser;
  accessToken: string;
}

// [แก้ไข 2] ใช้ NextAuthOptions ซึ่งเป็น Type ที่ถูกต้องสำหรับ Next.js App Router
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
        } catch (e: unknown) { // [แก้ไข 3] เปลี่ยน any เป็น unknown เพื่อความปลอดภัย
          let errorMessage = 'An error occurred during sign in.';
          // ตรวจสอบชนิดของ error ก่อนใช้งาน
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
    // [แก้ไข 4] เพิ่ม Type ให้กับพารามิเตอร์ของ jwt callback
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    // [แก้ไข 5] เพิ่ม Type ให้กับพารามิเตอร์ของ session callback
    async session({ session, token }: { session: Session; token: JWT }) {
      // นำข้อมูลจาก token ไปใส่ใน session
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.id;
        // เราได้ขยาย session.user ให้มี username แล้วในไฟล์ .d.ts
        session.user.username = token.username; 
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Error "is not callable" จะหายไปหลังจากแก้ Type เป็น NextAuthOptions
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };