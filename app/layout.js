import './globals.css';

export const metadata = {
  title: 'Leanivio — Personalized Meal Plans',
  description: 'A personalized weight-loss meal plan based on your body, lifestyle, preferences, and budget.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
