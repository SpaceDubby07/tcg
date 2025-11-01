import setsData from '@/data/sets/en.json';
import SetFilter from './SetFilter';

export default function SetsList() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pokémon Card Sets
          </h1>
          <p className="text-gray-600">
            Explore classic and modern Pokémon TCG sets
          </p>
        </div>

        <div className="space-y-4">
          <SetFilter sets={setsData} />
        </div>
      </div>
    </div>
  );
}
