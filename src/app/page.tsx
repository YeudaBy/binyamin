"use client"

import {Card, DonutChart, Icon, Title} from "@tremor/react";
import Link from "next/link";
import {useEffect, useState} from "react";
import {repo} from "remult";
import {Page, PageStatus} from "@/shared/Entities/Page";
import {RiArrowLeftSLine, RiCandleFill, RiShareFill} from "@remixicon/react";
import {AnimatePresence, motion} from "framer-motion";
import {Log} from "@/shared/Entities/Log";

const pRepo = repo(Page)
const lRepo = repo(Log)

export default function Home() {
    const [taken, setTaken] = useState<number>()
    const [completed, setCompleted] = useState<number>()
    const [available, setAvailable] = useState<number>()

    useEffect(() => {
        pRepo.count({pageStatus: PageStatus.Completed}).then(setCompleted)
        pRepo.count({pageStatus: PageStatus.Taken}).then(setTaken)
        pRepo.count().then(setAvailable)
    }, []);

    return (
        <div className="bg-tremor-brand-muted/20 h-screen">
            <div className={"py-6"}>

                <Icon icon={RiCandleFill} size={"xl"} className={"text-center scale-150 w-full"}/>

                <Title className={"text-center text-7xl tracking-wide"}>סיום הש״ס</Title>
                <Title className={"text-center text-3xl font-light tracking-wide mx-8"}>
                    לעילוי נשמת ידידינו
                    <span className={"font-extrabold"}> בנימין </span>
                    יעבץ בן
                    <span className={"font-extrabold"}> אפרים פישל </span>
                    זצ״ל
                </Title>
            </div>

            <DonutChart
                className={"my-4 text-gray-200"}
                showAnimation
                noDataText={"No data yet"}
                data={[
                    {
                        name: "נלקחו",
                        value: taken
                    }, {
                        name: "הסתיימו",
                        value: completed
                    }, {
                        name: "זמינים",
                        value: available
                    }
                ]}
                variant="donut"
                valueFormatter={n => `${n} דפים`}
            />


            <Link href={"/pages-list"}>
                <Card
                    className={"mx-4 max-w-sm m-auto mt-6 flex gap-2 items-center justify-between hover:scale-105 transition-transform"}>
                    <Title className={"text-2xl tracking-wide"}>לקיחת דפים</Title>
                    <Icon size={"lg"} icon={RiArrowLeftSLine}/>
                </Card>
            </Link>
            <Link href={"/my-pages"}>
                <Card
                    className={"mx-4 max-w-sm m-auto mt-6 flex gap-2 items-center justify-between hover:scale-105 transition-transform"}>
                    <Title className={"text-2xl tracking-wide"}>הדפים שלי</Title>
                    <Icon size={"lg"} icon={RiArrowLeftSLine}/>
                </Card>
            </Link>
            <Card onClick={() => navigator.share({url: location.href})}
                  className={"mx-4 bg-tremor-background-emphasis max-w-sm m-auto mt-6 flex gap-2 items-center justify-between hover:scale-105 transition-transform cursor-pointer"}>
                <Title className={"text-xl tracking-wide font-extrabold text-tremor-border"}>שתף</Title>
                <Icon size={"xs"} icon={RiShareFill} color={"white"}/>
            </Card>

            <EventLog/>
        </div>
    );
}


export function EventLog() {
    const [events, setEvents] = useState<Log[]>();
    const [index, setIndex] = useState(0);
    const [visibleText, setVisibleText] = useState("");
    const [fullText, setFullText] = useState("");
    const typingSpeed = 60;

    useEffect(() => {
        lRepo.find({
            where: {show: true},
            limit: 50,
            orderBy: {createdAt: "asc"},
        }).then(setEvents);
    }, []);

    useEffect(() => {
        if (!events || events.length === 0) return;

        const log = events[index];
        const timeAgo = formatTimeAgo(new Date(log.createdAt));
        const full = `${log.text}  •  ${timeAgo}`;

        setFullText(full);
        setVisibleText("");

        let charIndex = 0;

        const type = () => {
            setVisibleText(full.slice(0, charIndex));
            charIndex++;
            if (charIndex <= full.length) {
                setTimeout(type, typingSpeed);
            }
        };

        type();

        const nextIndexTimeout = setTimeout(() => {
            setIndex((prev) => (prev + 1) % events.length);
        }, full.length * typingSpeed + 1000);

        return () => clearTimeout(nextIndexTimeout);
    }, [index, events]);

    if (!events) {
        return (
            <div className="w-full text-center py-6 h-12">
                <div className="text-lg font-medium text-gray-500 animate-pulse">
                    טוען אירועים...
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="w-full text-center py-6 h-12">
                <div className="text-lg font-medium text-gray-500">
                    אין אירועים זמינים
                </div>
            </div>
        );
    }

    return (
        <div className="w-full text-center py-6 h-12">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -10}}
                    transition={{duration: 0.3}}
                    className="text-base font-medium text-gray-200 whitespace-pre-wrap"
                >
                    {visibleText}
                    <span className="animate-pulse">▍</span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // שניות

    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);
    const weeks = Math.floor(diff / 604800);

    if (diff < 60) return "לפני כמה שניות";
    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days < 7) return `לפני ${days} ימים`;
    return `לפני ${weeks} שבועות`;
}
