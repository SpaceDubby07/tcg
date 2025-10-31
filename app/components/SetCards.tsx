'use client';

import Image from 'next/image';
import { Set } from '@/types/types';
import Link from 'next/link';

export default function SetCard({ set }: { set: Set }) {
  return (
    <div className="group relative bg-linear-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Animated linear background on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative p-6">
        {/* Logo and Status Badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center p-3 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ring-2 ring-gray-100">
              <Image
                src={set.images.logo}
                alt={`${set.name} logo`}
                className="w-full h-full object-contain"
                width={96}
                height={96}
              />
            </div>
          </div>

          {/* Legality Badge */}
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              set.legalities.unlimited === 'Legal'
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-red-100 text-red-700 ring-1 ring-red-200'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                set.legalities.unlimited === 'Legal'
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
              }`}
            />
            {set.legalities.unlimited === 'Legal'
              ? 'Tournament Legal'
              : 'Banned'}
          </div>
        </div>

        {/* Set Information */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {set.name}
          </h2>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-500">
              Series:
            </span>
            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-sm font-semibold">
              {set.series}
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Total Cards
              </span>
              <span className="text-lg font-bold text-gray-900">
                {set.total}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Released
              </span>
              <span className="text-lg font-bold text-gray-900">
                {new Date(set.releaseDate).getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className="px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            onClick={() => console.log(`Open pack for ${set.name}`)}
          >
            Open Pack
          </button>

          <Link
            className="px-4 py-3 bg-gray-900 hover:bg-black text-white rounded-xl transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            href={{
              pathname: `/sets/${set.id}`,
              query: { name: set.name },
            }}
          >
            <button className="cursor-pointer">View Cards</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
