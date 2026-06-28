import setsData from '@/data/sets/en.json';
import SetGrid from './SetGrid';

export default function SetsList() {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Pokémon Card Sets
          </h1>
          <p className="text-slate-400 text-base">
            Browse every era of the Pokémon TCG
          </p>
        </div>
        <SetGrid sets={setsData} />
      </div>
    </div>
  );
}
