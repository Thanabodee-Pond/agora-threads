// /api/src/auth/[...nextauth].ts

// [แก้ไข] Import Type ที่จำเป็นเพิ่ม
import NextAuth, { NextAuthOptions, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

// [แนะนำ] สร้าง Interface สำหรับข้อมูลที่ได้จาก Backend เพื่อหลีกเลี่ยง `any`
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
      // [แก้ไข] ลบ `req` ที่ไม่ได้ใช้ออก
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
              // เพิ่ม name และ email เพื่อให้ตรงกับ Type เริ่มต้นของ NextAuth
              name: backendResponse.user.username, 
              email: null, 
            };
          } else {
            return null;
          }
        } catch (e: unknown) { // [แก้ไข] ใช้ unknown แทน any
          // ตรวจสอบ error อย่างปลอดภัย
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
    // [แก้ไข] เพิ่ม Type ให้กับพารามิเตอร์ และลบ async ที่ไม่จำเป็น
    jwt({ token, user }: { token: JWT; user?: User }) {
      // user object จะมีค่าแค่ตอน login ครั้งแรก
      if (user) {
        // ค่าที่ถูก return จาก authorize จะถูกส่งมาที่นี่ใน object `user`
        // เราต้อง cast `user` เป็น any เพื่อเข้าถึง accessToken ที่เราเพิ่มเข้ามาเอง
        const extendedUser = user as any; 
        token.id = extendedUser.id;
        token.username = extendedUser.username;
        token.accessToken = extendedUser.accessToken;
      }
      return token;
    },
    // [แก้ไข] เพิ่ม Type ให้กับพารามิเตอร์ และลบ async ที่ไม่จำเป็น
    session({ session, token }: { session: any; token: JWT }) {
      // นำข้อมูลจาก token มาใส่ใน session object
      if (token) {
        session.accessToken = token.accessToken;
        if (session.user) {
          session.user.id = token.id;
          session.user.name = token.username;
          // ถ้าต้องการ username ใน session.user ด้วย
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