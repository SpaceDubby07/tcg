import CardList from '@/app/components/CardList';

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
