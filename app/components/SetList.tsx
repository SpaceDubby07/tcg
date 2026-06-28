import setsData from '@/data/sets/en.json';
import { getDeckSetIds } from '@/lib/decks';
import SetFilter from './SetFilter';

export default function SetsList() {
  const deckSetIds = getDeckSetIds();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-200 mb-2">
            Pokémon Card Sets
          </h1>
          <p className="text-gray-50">
            Explore classic and modern Pokémon TCG sets
          </p>
        </div>

        <div className="space-y-4">
          <SetFilter sets={setsData} deckSetIds={deckSetIds} />
        </div>
      </div>
    </div>
  );
}
