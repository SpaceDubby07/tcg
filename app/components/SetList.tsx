import setsData from '@/data/sets/en.json';
import { getDeckSetIds } from '@/lib/decks';
import SetGrid from './SetGrid';

export default function SetsList() {
  const deckSetIds = getDeckSetIds();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Pokémon Card Sets
          </h1>
          <p className="text-neutral-400">
            Explore every era of the Pokémon TCG
          </p>
        </div>

        <SetGrid sets={setsData} deckSetIds={deckSetIds} />
      </div>
    </div>
  );
}
