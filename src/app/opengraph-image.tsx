import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'מצב התקדמות סיום הש"ס';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getStats() {
    // Determine base URL based on environment
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'https://your-production-domain.com' // Fallback for other production environments
        : 'http://localhost:3000';
        
    const response = await fetch(`${baseUrl}/api/StatsController.getPageStats`, {
        method: 'POST', // Backend methods are always called via POST
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        console.error('Failed to fetch stats', response.status, response.statusText);
        throw new Error('Failed to fetch stats');
    }
    const data = await response.json();
    return data.result; // Remult wraps the result in a 'result' property
}

// Image generation
export default async function Image() {
  // Fetch data using the backend method via fetch
  const { completed, taken, total } = await getStats();
  console.log(completed, taken, total);
  const available = total - completed - taken;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Load fonts
  const heeboBold = fetch(
    new URL('./fonts/Heebo-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const heeboRegular = fetch(
    new URL('./fonts/Heebo-Regular.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      // Image container
      <div
        style={{
          height: '100%',
          width: '100%',
          direction: 'rtl',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(to bottom right, #EFF6FF, #DBEAFE)',
          color: '#1E3A8A',
          fontFamily: '"Heebo Regular"',
        }}
      >
        {/* Main Title */}
        <div style={{ fontSize: 84, fontFamily: '"Heebo Bold"', marginBottom: 20 }}>
          סיום הש״ס
        </div>
        {/* Subtitle */}
        <div style={{ fontSize: 32, opacity: 0.9, marginBottom: 40 }}>
          לעילוי נשמת בנימין יעבץ בן אפרים פישל זצ״ל
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: '80%',
            height: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: `${completionPercentage}%`,
              height: '100%',
              backgroundImage: 'linear-gradient(to left, #2563EB, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontFamily: '"Heebo Bold"',
            }}
          >
            {completionPercentage}%
          </div>
        </div>

        {/* Stats Container */}
        <div style={{ display: 'flex', gap: '60px', fontSize: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: '"Heebo Bold"', fontSize: 48 }}>{completed}</span>
            <span style={{ opacity: 0.8 }}>הושלמו</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: '"Heebo Bold"', fontSize: 48, color: '#D97706' }}>{taken}</span>
            <span style={{ opacity: 0.8 }}>נלקחו</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: '"Heebo Bold"', fontSize: 48, color: '#16A34A' }}>{available}</span>
            <span style={{ opacity: 0.8 }}>פנויים</span>
          </div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
      fonts: [
        {
          name: 'Heebo Bold',
          data: await heeboBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Heebo Regular',
          data: await heeboRegular,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
} 