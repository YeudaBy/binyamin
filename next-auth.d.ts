// types/next-auth.d.ts
import {DefaultSession, DefaultUser} from "next-auth"
import {AccessToken} from "@spotify/web-api-ts-sdk";

declare module "next-auth" {
    interface Session {
        accessToken?: AccessToken
        user: {
            id?: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        id: string
    }
}
