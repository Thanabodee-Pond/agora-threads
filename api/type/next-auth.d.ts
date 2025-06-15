import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user?: {
      id: string;
      username: string;
    } & DefaultSession['user'];
  }

  interface User {
    username?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string;
    accessToken?: string;
    id?: string;
  }
}