import type { Metadata } from 'next';
import SetList from './components/SetList';

export const metadata: Metadata = {
  title: 'Sets',
  description:
    'Browse every Pokémon TCG set from Base Set to the latest expansions. Click a set to explore its cards.',
  alternates: { canonical: 'https://tcg.zaclark.com' },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <SetList />
    </main>
  );
}
