import NextAuth, {getServerSession} from 'next-auth/next'
import GoogleProvider from "next-auth/providers/google";
import {User} from "@/shared/Entities/User";
import {api} from "@/shared/api";


export const auth = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({profile}) {
            if (profile?.email) {
                const remult = await api.getRemult();
                const userRepo = remult.repo(User);
                const existingUser = await userRepo.findOne({
                    where: {email: profile.email},
                });
                if (!existingUser) {
                    const newUser = new User();
                    newUser.name = profile.name || "Unknown";
                    newUser.email = profile.email;
                    await userRepo.insert(newUser);
                } else {
                    existingUser.name = profile.name || existingUser.name;
                    await userRepo.save(existingUser);
                }
            }
            return true;
        },
        async jwt({token, user}) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({session, token}) {
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },

})

export async function getUserOnServer(req: Request) {
    const remult = await api.getRemult(req)
    const session = await getServerSession()
    return remult.repo(User).findFirst({id: session?.user.id})
}
