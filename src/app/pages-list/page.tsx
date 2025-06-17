import PagesListClient from './PagesListClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'לקיחת דפים | סיום הש״ס',
    description: 'בחרו מסכת ודפים ללימוד מתוך רשימת הדפים הזמינים והיו שותפים בהשלמת הש"ס לעילוי נשמת בנימין יעבץ זצ"ל.',
};

export default function PagesListPage() {
    return <PagesListClient />;
}
