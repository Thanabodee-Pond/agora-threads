import { DefaultSession, DefaultUser } from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    accessToken: string;
  }
}

declare module "next-auth" {
  interface User extends DefaultUser {
    username: string;
    accessToken: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"]; 
    accessToken: string;
  }
}