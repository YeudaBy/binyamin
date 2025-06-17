"use client"

import {Card, DonutChart, Icon, Title} from "@tremor/react";
import Link from "next/link";
import {useEffect, useState} from "react";
import {repo} from "remult";
import {Page, PageStatus} from "@/shared/Entities/Page";
import {RiArrowLeftSLine, RiCandleFill, RiShareFill, RiBook2Line, RiUser3Line, RiInformationLine} from "@remixicon/react";
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
        <div className="min-h-screen flex flex-col items-center bg-fixed">
            <div className="w-full max-w-2xl px-2 md:px-0 flex flex-col gap-8 mt-6 mb-8">
                <div className="glass-effect rounded-2xl p-6 md:p-10 mb-2 shadow-xl border border-blue-100 flex flex-col items-center text-center">
                    <Icon icon={RiCandleFill} size="xl" className="mb-2 text-blue-600"/>
                    <Title className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2 font-heading text-center">סיום הש״ס</Title>
                    <div className="text-lg md:text-2xl font-light tracking-wide text-blue-900 leading-snug font-body text-center">
                        לעילוי נשמת ידידינו
                        <span className="font-extrabold"> בנימין </span>
                        יעבץ בן
                        <span className="font-extrabold"> אפרים פישל </span>
                        זצ״ל
                    </div>
                </div>

                <div className="glass-effect rounded-2xl p-6 md:p-10 shadow-xl border border-blue-100 flex flex-col items-center">
                    <DonutChart
                        className="my-4"
                        showAnimation
                        noDataText={"No data yet"}
                        data={[
                            { name: "נלקחו", value: taken },
                            { name: "הסתיימו", value: completed },
                            { name: "זמינים", value: available }
                        ]}
                        variant="donut"
                        valueFormatter={n => `${n} דפים`}
                    />
                </div>

                <div className="flex flex-col gap-6 w-full">
                    <Link href={"/pages-list"}>
                        <Card className="rounded-2xl p-6 flex gap-4 items-center justify-between shadow-lg cursor-pointer btn-border-draw">
                            <div className="flex items-center gap-3">
                                <Icon icon={RiBook2Line} size={"xl"} className="text-blue-600 btn-icon"/>
                                <span className="text-2xl font-bold text-blue-800 font-body text-right">לקיחת דפים</span>
                            </div>
                            <Icon size={"lg"} icon={RiArrowLeftSLine} className="text-blue-400 btn-icon"/>
                        </Card>
                    </Link>
                    <Link href={"/my-pages"}>
                        <Card className="rounded-2xl p-6 flex gap-4 items-center justify-between shadow-md cursor-pointer btn-border-draw">
                            <div className="flex items-center gap-3">
                                <Icon icon={RiUser3Line} size={"xl"} className="text-cyan-600 btn-icon"/>
                                <span className="text-2xl font-semibold text-cyan-800 font-body text-right">הדפים שלי</span>
                            </div>
                            <Icon size={"lg"} icon={RiArrowLeftSLine} className="text-cyan-400 btn-icon"/>
                        </Card>
                    </Link>
                    <Card 
                        onClick={() => navigator.share({url: location.href})} 
                        className="rounded-full p-4 flex items-center justify-center shadow-md cursor-pointer w-16 h-16 mx-auto btn-border-draw"
                        aria-label="שתף את הפרויקט"
                    >
                        <Icon size={"xl"} icon={RiShareFill} className="text-blue-500 btn-icon"/>
                    </Card>
                    <Link href={"/about"}>
                        <Card className="rounded-2xl p-4 flex gap-3 items-center justify-center shadow-md cursor-pointer btn-border-draw">
                            <Icon icon={RiInformationLine} size={"lg"} className="text-blue-400 btn-icon"/>
                            <span className="text-lg font-medium text-blue-700 font-body text-right">מידע על הפרויקט</span>
                        </Card>
                    </Link>
                </div>
            </div>
            <div className="w-full max-w-2xl px-2 md:px-0 mb-8">
                <div className="glass-effect rounded-2xl p-6 md:p-8 mt-10 shadow-xl border border-blue-100 text-center">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 font-heading text-center">עדכונים אחרונים</h3>
                    <EventLog/>
                </div>
            </div>
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
            orderBy: {createdAt: "desc"},
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
        }, full.length * typingSpeed + 2000);

        return () => clearTimeout(nextIndexTimeout);
    }, [index, events]);

    if (!events) {
        return (
            <div className="py-4 min-h-[60px] flex items-center justify-center">
                <div className="text-base text-blue-600 animate-pulse">
                    טוען עדכונים...
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="py-4 min-h-[60px] flex items-center justify-center">
                <div className="text-base text-blue-700">
                    אין עדכונים זמינים
                </div>
            </div>
        );
    }

    return (
        <div className="py-4 min-h-[60px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{opacity: 0, y: 15}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -15}}
                    transition={{duration: 0.5, ease: "easeInOut"}}
                    className="text-base font-medium text-blue-800 leading-relaxed max-w-lg text-center"
                >
                    {visibleText}
                    <span className="animate-pulse text-blue-500 ml-1">▍</span>
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
