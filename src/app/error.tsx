'use client';

import { useEffect } from 'react';
import { Card, Button, Icon, Title } from '@tremor/react';
import { RiErrorWarningLine } from '@remixicon/react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <Card className="glass-effect rounded-2xl p-8 shadow-xl border border-red-200 max-w-lg text-center">
            <Icon icon={RiErrorWarningLine} size="xl" className="text-red-500 mb-4"/>
            <Title className="text-2xl font-bold text-red-700 mb-2 font-heading">
                אופס, משהו השתבש
            </Title>
            <p className="text-red-600 mb-6 font-body">
                אנו מצטערים, אך נתקלנו בשגיאה בלתי צפויה.
            </p>
            <Button
                onClick={() => reset()}
                className="bg-red-500 hover:bg-red-600 text-white font-body"
            >
                נסה/י שוב
            </Button>
        </Card>
    </div>
  );
} 