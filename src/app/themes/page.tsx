'use client';

import { useState } from 'react';
import { Card, Button, TextInput as Input, Switch } from '@tremor/react';
import { Inter, Heebo, Rubik, Alef, Noto_Serif, Assistant, Open_Sans } from 'next/font/google';

// Initialize Google Fonts
const inter = Inter({ subsets: ['latin'] });
const heebo = Heebo({ subsets: ['latin'] });
const rubik = Rubik({ subsets: ['latin'] });
const alef = Alef({ subsets: ['latin'], weight: ['400', '700'] });
const notoSerif = Noto_Serif({ subsets: ['latin'] });
const assistant = Assistant({ subsets: ['latin'] });
const openSans = Open_Sans({ subsets: ['latin'] });

const fonts = [
  {
    name: 'Heebo',
    className: heebo.className,
    description: 'פונט עברי מודרני וקריא מאוד',
    fontObject: heebo,
  },
  {
    name: 'Rubik',
    className: rubik.className,
    description: 'פונט עגול ונעים, מתאים לכותרות',
    fontObject: rubik,
  },
  {
    name: 'Alef',
    className: alef.className,
    description: 'פונט עברי נקי ומינימליסטי',
    fontObject: alef,
  },
  {
    name: 'Noto Serif',
    className: notoSerif.className,
    description: 'פונט סריף אלגנטי לטקסטים ארוכים',
    fontObject: notoSerif,
  },
  {
    name: 'Assistant',
    className: assistant.className,
    description: 'פונט ישראלי פופולרי וברור',
    fontObject: assistant,
  },
  {
    name: 'Open Sans',
    className: openSans.className,
    description: 'פונט אוניברסלי וקריא',
    fontObject: openSans,
  },
  {
    name: 'Inter',
    className: inter.className,
    description: 'פונט מודרני לממשקים דיגיטליים',
    fontObject: inter,
  },
];

const sampleTexts = {
  title: 'סיום הש״ס',
  subtitle: 'לעילוי נשמת ידידינו בנימין יעבץ בן אפרים פישל זצ״ל',
  body: 'פרויקט "סיום הש״ס" הוא יוזמה מיוחדת לעילוי נשמת ידידינו היקר. המטרה היא לסיים את כל הש״ס באופן משותף, כאשר כל משתתף לוקח על עצמו דפים מסוימים ללמוד לעילוי נשמתו.',
  quote: '"תלמוד תורה כנגד כולם"',
};

const tabs = [
  { id: 'fonts', label: 'פונטים', icon: '🔤' },
  { id: 'themes', label: 'ערכות נושא', icon: '🎨' },
  { id: 'components', label: 'רכיבים', icon: '🧩' },
  { id: 'colors', label: 'צבעים', icon: '🌈' },
];

const themes = [
  {
    name: 'Ocean Glass',
    description: 'עיצוב זכוכית עם גוונים כחולים',
    colors: {
      primary: 'bg-blue-600',
      secondary: 'bg-blue-100',
      accent: 'bg-cyan-500',
      background: 'bg-gradient-to-br from-blue-50 to-cyan-50'
    }
  },
  {
    name: 'Warm Sunset',
    description: 'גוונים חמים של שקיעה',
    colors: {
      primary: 'bg-orange-600',
      secondary: 'bg-orange-100',
      accent: 'bg-rose-500',
      background: 'bg-gradient-to-br from-orange-50 to-rose-50'
    }
  },
  {
    name: 'Forest Green',
    description: 'גוונים ירוקים טבעיים',
    colors: {
      primary: 'bg-green-600',
      secondary: 'bg-green-100',
      accent: 'bg-emerald-500',
      background: 'bg-gradient-to-br from-green-50 to-emerald-50'
    }
  },
  {
    name: 'Royal Purple',
    description: 'גוונים סגולים מלכותיים',
    colors: {
      primary: 'bg-purple-600',
      secondary: 'bg-purple-100',
      accent: 'bg-violet-500',
      background: 'bg-gradient-to-br from-purple-50 to-violet-50'
    }
  },
];

export default function ShowcasePage() {
  const [activeTab, setActiveTab] = useState('fonts');
  const [activeFont, setActiveFont] = useState(fonts[0]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'fonts':
        return <FontsContent activeFont={activeFont} setActiveFont={setActiveFont} />;
      case 'themes':
        return <ThemesContent />;
      case 'components':
        return <ComponentsContent />;
      case 'colors':
        return <ColorsContent />;
      default:
        return <FontsContent activeFont={activeFont} setActiveFont={setActiveFont} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
          <h1 className="text-3xl font-bold text-blue-800 text-right font-heading">דוגמאות עיצוב</h1>
          <p className="text-blue-600 text-right mt-1 font-body">פונטים, ערכות נושא ורכיבי UI</p>
        </div>
      </div>
      
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4">
          {/* Tab Bar Area */}
          <div className="relative">
            <div className="flex justify-end items-end">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-5 py-2.5 flex items-center gap-2 text-sm font-medium transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'text-blue-700'
                      : 'text-blue-600 hover:text-blue-800'
                    }
                  `}
                >
                  <div
                    className={`
                      absolute inset-0 transition-all duration-300 ease-out
                      ${activeTab === tab.id
                        ? 'bg-gray-50 rounded-t-xl'
                        : 'bg-transparent'
                      }
                    `}
                  >
                    {activeTab === tab.id && <div className="tab-curve-connector"></div>}
                  </div>
                  <span className="relative z-10 text-base">{tab.icon}</span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-50 rounded-b-xl rounded-tl-xl p-6 md:p-8 relative z-20">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function FontsContent({ activeFont, setActiveFont }: { activeFont: any, setActiveFont: any }) {
  return (
    <div className={`space-y-8 ${activeFont.className}`}>
      {/* Font Selector */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700 text-right font-heading">בחר פונט</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fonts.map((font) => (
            <Button
              key={font.name}
              onClick={() => setActiveFont(font)}
              className={`p-4 h-auto flex flex-col items-start text-right ${
                activeFont.name === font.name 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-50 border-blue-200 hover:border-blue-400'
              }`}
            >
              <span className="font-semibold text-sm">{font.name}</span>
              <span className="text-xs opacity-75 mt-1">{font.description}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Font Previews */}
      <div className="grid gap-6">
        {/* Title Preview */}
        <Card className="glass-effect rounded-2xl p-8 shadow-xl border border-blue-100">
          <h3 className="text-xl font-semibold mb-4 text-blue-600 font-heading">כותרת ראשית</h3>
          <div className="text-4xl md:text-5xl font-bold text-blue-800 text-center mb-4">
            {sampleTexts.title}
          </div>
          <div className="text-lg md:text-xl text-blue-700 text-center leading-relaxed">
            {sampleTexts.subtitle}
          </div>
        </Card>

        {/* Typography Hierarchy */}
        <Card className="glass-effect rounded-2xl p-8 shadow-xl border border-blue-100">
          <h3 className="text-xl font-semibold mb-6 text-blue-600 font-heading">היררכיית טיפוגרפיה</h3>
          <div className="space-y-4 text-right">
            <h1 className="text-4xl font-bold text-blue-800">כותרת H1 - גדולה ובולטת</h1>
            <h2 className="text-3xl font-semibold text-blue-700">כותרת H2 - משנית</h2>
            <h3 className="text-2xl font-medium text-blue-600">כותרת H3 - קטנה</h3>
            <p className="text-lg text-blue-900">פסקה רגילה - טקסט גוף עיקרי לקריאה</p>
            <p className="text-base text-blue-800">טקסט קטן - מידע נוסף ופרטים</p>
            <p className="text-sm text-blue-600">טקסט זעיר - הערות שוליים</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ThemesContent() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-blue-700 text-right font-heading">ערכות נושא</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => (
          <Card key={theme.name} className="glass-effect rounded-2xl p-6 shadow-xl border border-blue-100">
            <h3 className="text-xl font-bold text-blue-800 mb-2 text-right font-heading">{theme.name}</h3>
            <p className="text-blue-600 mb-4 text-right font-body">{theme.description}</p>
            <div className="flex gap-3 justify-end mb-4">
              <div className={`w-8 h-8 rounded-full ${theme.colors.primary} shadow-md`}></div>
              <div className={`w-8 h-8 rounded-full ${theme.colors.secondary} shadow-md`}></div>
              <div className={`w-8 h-8 rounded-full ${theme.colors.accent} shadow-md`}></div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              החל ערכת נושא
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ComponentsContent() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-blue-700 text-right font-heading">רכיבי UI</h2>
      
      {/* Buttons */}
      <Card className="glass-effect rounded-2xl p-6 shadow-xl border border-blue-100">
        <h3 className="text-xl font-semibold mb-4 text-blue-600 text-right font-heading">כפתורים</h3>
        <div className="flex flex-wrap gap-4 justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">כפתור ראשי</Button>
          <Button className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100">כפתור משני</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">הצלחה</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white">מחיקה</Button>
        </div>
      </Card>

      {/* Form Elements */}
      <Card className="glass-effect rounded-2xl p-6 shadow-xl border border-blue-100">
        <h3 className="text-xl font-semibold mb-4 text-blue-600 text-right font-heading">אלמנטי טופס</h3>
        <div className="space-y-4 max-w-md mr-auto">
          <div>
            <label htmlFor="demo-name" className="text-base mb-2 block text-right text-blue-700">שם מלא</label>
            <Input 
              id="demo-name" 
              placeholder="הכנס את שמך המלא" 
              className="text-right"
            />
          </div>
          <div className="flex items-center justify-end space-x-3 space-x-reverse">
            <label htmlFor="demo-notifications" className="text-base text-blue-700">קבלת עדכונים</label>
            <Switch id="demo-notifications" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ColorsContent() {
  const colorPalettes = [
    { name: 'כחולים', colors: ['bg-blue-100', 'bg-blue-300', 'bg-blue-500', 'bg-blue-700', 'bg-blue-900'] },
    { name: 'ירוקים', colors: ['bg-green-100', 'bg-green-300', 'bg-green-500', 'bg-green-700', 'bg-green-900'] },
    { name: 'אדומים', colors: ['bg-red-100', 'bg-red-300', 'bg-red-500', 'bg-red-700', 'bg-red-900'] },
    { name: 'סגולים', colors: ['bg-purple-100', 'bg-purple-300', 'bg-purple-500', 'bg-purple-700', 'bg-purple-900'] },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-blue-700 text-right font-heading">פלטת צבעים</h2>
      <div className="grid gap-6">
        {colorPalettes.map((palette) => (
          <Card key={palette.name} className="glass-effect rounded-2xl p-6 shadow-xl border border-blue-100">
            <h3 className="text-lg font-semibold mb-4 text-blue-600 text-right font-heading">{palette.name}</h3>
            <div className="flex gap-2 justify-end">
              {palette.colors.map((color, index) => (
                <div key={index} className={`w-12 h-12 rounded-lg ${color} shadow-md`}></div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 