import {signIn, useSession} from 'next-auth/react'
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
