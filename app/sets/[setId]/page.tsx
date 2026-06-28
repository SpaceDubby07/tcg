import type { Metadata } from 'next';
import CardList from '@/app/components/CardList';
import setsData from '@/data/sets/en.json';

export async function generateStaticParams() {
  return setsData.map((set) => ({ setId: set.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ setId: string }>;
}): Promise<Metadata> {
  const { setId } = await params;
  const set = setsData.find((s) => s.id === setId);
  if (!set) return {};

  const description = `Browse all ${set.total} cards from ${set.name} (${set.series} series), released ${set.releaseDate}.`;

  return {
    title: set.name,
    description,
    openGraph: {
      title: set.name,
      description,
      images: [{ url: set.images.logo, alt: set.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: set.name,
      description,
      images: [set.images.logo],
    },
    alternates: { canonical: `https://tcg.zaclark.com/sets/${setId}` },
  };
}

interface SetPageProps {
  params: Promise<{ setId: string }>;
}

export default async function SetPage({ params }: SetPageProps) {
  const { setId } = await params;

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <CardList setId={setId} />
      </div>
    </main>
  );
}
