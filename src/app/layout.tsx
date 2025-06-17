import type {Metadata} from "next";
import {Heebo, Noto_Serif} from "next/font/google";
import "./globals.css";
import {Providers} from "@/app/Providers";

const heebo = Heebo({
    subsets: ['latin'],
    variable: '--font-heebo',
    display: 'swap',
});

const notoSerif = Noto_Serif({
    subsets: ['latin'],
    variable: '--font-noto-serif',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "סיום הש״ס | לעילוי נשמת בנימין יעבץ זצ״ל",
    description: "הצטרפו ליוזמת סיום הש״ס המשותף לעילוי נשמת ידידינו היקר בנימין יעבץ בן אפרים פישל זצ״ל. בחרו דפים ללימוד והיו שותפים במצווה.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
    return (
        <html lang="he" dir="rtl" className={`${heebo.variable} ${notoSerif.variable}`}>
        <body className={heebo.className}>
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}
