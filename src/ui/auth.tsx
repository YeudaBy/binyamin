"use client"

import {signIn, signOut, useSession} from "next-auth/react";
import {Card, Title} from "@tremor/react";
import {RiGoogleFill} from "@remixicon/react";
import {ReactNode, useEffect} from 'react'
import {remult, UserInfo} from 'remult'

export default function Auth({children}: { children: ReactNode }) {
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') signIn()
    }, [session])

    useEffect(() => {
        remult.initUser().then(() => {
            remult.user = session.data?.user as UserInfo
        })
    }, [session]);

    if (session.status !== 'authenticated') return <>Loading...</>
    return children
}

export function AuthButton() {
    const {data: session} = useSession();

    if (session) {
        return (
            <Card
                onClick={() => signOut()}
                className={"mx-4 max-w-sm m-auto mt-6 flex gap-2 items-center justify-between hover:scale-105 transition-transform cursor-pointer"}>
                <Title className={"text-xl tracking-wide"}>התנתק</Title>
                <img src={session.user?.image || ""} alt={session.user?.name || ""} className="w-8 h-8 rounded-full"/>
            </Card>
        );
    }

    return (
        <Card
            onClick={() => signIn("google")}
            className={"mx-4 max-w-sm m-auto mt-6 flex gap-2 items-center justify-between hover:scale-105 transition-transform cursor-pointer"}>
            <Title className={"text-xl tracking-wide"}>התחבר עם Google</Title>
            <RiGoogleFill size={24}/>
        </Card>
    );
}
