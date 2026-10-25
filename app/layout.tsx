import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rung — AI task routing planner',
  description: 'Turn a Markdown PRD into an editable task list, inspect live AI capability-tier recommendations, and export a human-reviewed routing plan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
