"use client"

import {useEffect, useState} from "react";
import {Page} from "@/shared/Entities/Page";
import {repo} from "remult";
import {useSession} from "next-auth/react";
import {User} from "@/shared/Entities/User";
import Auth from "@/ui/auth";

const pRepo = repo(Page)
const uRepo = repo(User)

export default function MyPagesPage() {
    const [pages, setPages] = useState<Page[]>([])
    const {data} = useSession()

    useEffect(() => {
        if (!data?.user) return
        const getByUser = async () => {
            const pages = await pRepo.find({
                where: {byUser: data.user.id},
                orderBy: {tractate: "desc"},
                include: {tractate: true}
            })
            setPages(pages)
        }
        getByUser()
    }, [data]);

    return <Auth>
        <>Count: {pages.length}</>
    </Auth>
}
