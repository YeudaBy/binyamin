import {Card, Icon, Title} from "@tremor/react";
import Link from "next/link";
import {RiArrowRightSLine, RiBookOpenLine, RiCandleFill, RiGroupLine, RiHeartLine} from "@remixicon/react";
import type {Metadata} from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'אודות הפרויקט | סיום הש״ס',
    description: 'מידע על פרויקט סיום הש״ס המשותף לעילוי נשמת בנימין יעבץ זצ"ל, כיצד ניתן להשתתף, ומהי מטרת היוזמה.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col items-center bg-fixed">
            <div className="w-full max-w-2xl px-2 md:px-0 flex flex-col gap-8 mt-6 mb-8">
                {/* Header */}
                <div
                    className="glass-effect rounded-2xl p-6 md:p-10 mb-2 shadow-xl border border-blue-100 flex flex-col items-center text-center">
                    <Link href="/" className="self-start mb-4 text-blue-600 hover:text-blue-800 transition-colors">
                        <Icon icon={RiArrowRightSLine} size="lg"/>
                    </Link>
                    <Icon icon={RiCandleFill} size="xl" className="mb-4 text-blue-600"/>
                    <Title
                        className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 font-heading">
                        מידע על הפרויקט
                    </Title>
                </div>

                {/* About the Project */}
                <Card className="glass-effect rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <Icon icon={RiBookOpenLine} size="xl" className="text-blue-600"/>
                        <Title className="text-2xl font-semibold text-blue-800 font-heading">אודות הפרויקט</Title>
                    </div>
                    <div className="space-y-4 text-blue-900 leading-relaxed font-body text-right">
                        <p>
                            פרויקט &#34;סיום הש״ס&#34; הוא יוזמה מיוחדת לעילוי נשמת ידידינו היקר
                            <span className="font-bold"> בנימין יעבץ בן אפרים פישל </span>
                            זצ״ל.
                        </p>
                        <p>
                            המטרה היא לסיים את כל הש״ס באופן משותף, כאשר כל משתתף לוקח על עצמו
                            דפים מסוימים ללמוד לעילוי נשמתו של בנימין.
                        </p>
                        <p>
                            הפרויקט מאפשר לכל אחד להצטרף ולתרום חלקו בלימוד התורה,
                            ובכך לזכות את נשמתו של הנפטר ולהנציח את זכרו.
                        </p>
                    </div>
                </Card>

                {/* How it Works */}
                <Card className="glass-effect rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <Icon icon={RiGroupLine} size="xl" className="text-cyan-600"/>
                        <Title className="text-2xl font-semibold text-cyan-800 font-heading">איך זה עובד?</Title>
                    </div>
                    <div className="space-y-4 text-blue-900 leading-relaxed font-body text-right">
                        <div className="flex gap-3">
                            <span
                                className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                            <p>בחר דפים זמינים מרשימת הדפים</p>
                        </div>
                        <div className="flex gap-3">
                            <span
                                className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                            <p>למד את הדפים שלקחת בקצב שמתאים לך</p>
                        </div>
                        <div className="flex gap-3">
                            <span
                                className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                            <p>סמן כהושלם כשסיימת ללמוד</p>
                        </div>
                        <div className="flex gap-3">
                            <span
                                className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                            <p>עקב אחר ההתקדמות הכללית של הפרויקט</p>
                        </div>
                    </div>
                </Card>

                {/* Memorial */}
                <Card className="glass-effect rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <Icon icon={RiHeartLine} size="xl" className="text-rose-500"/>
                        <Title className="text-2xl font-semibold text-rose-700 font-heading">לזכרו</Title>
                    </div>
                    <div className="space-y-4 text-blue-900 leading-relaxed text-center font-body">
                        <p className="text-lg font-medium font-heading text-center">
                            &#34;תהא נשמתו צרורה בצרור החיים&#34;
                        </p>
                        <p className="text-right">
                            כל דף שנלמד במסגרת הפרויקט הזה הוא זכות עצומה לנשמתו של בנימין זצ״ל,
                            ותרומה משמעותית להנצחת זכרו באופן הכי יפה - באמצעות לימוד התורה.
                        </p>
                        <p className="font-semibold text-blue-800 font-heading text-center">
                            יהי זכרו ברוך
                        </p>
                    </div>
                </Card>

                {/* Back to Home */}
                <Link href="/">
                    <Card
                        className="rounded-2xl p-4 flex gap-3 items-center justify-center shadow-md cursor-pointer btn-border-draw">
                        <Icon icon={RiArrowRightSLine} size="lg" className="text-blue-400 btn-icon"/>
                        <span className="text-lg font-medium text-blue-700 font-body">חזרה לדף הבית</span>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
