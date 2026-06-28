'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { animate } from 'animejs';

const TYPE_COLORS: Record<string, string> = {
  Fire: '#ff6b35',
  Water: '#4fc3f7',
  Grass: '#66bb6a',
  Lightning: '#ffd600',
  Psychic: '#ce93d8',
  Fighting: '#ef9a9a',
  Darkness: '#9575cd',
  Metal: '#b0bec5',
  Colorless: '#cfd8dc',
  Dragon: '#7e57c2',
  Fairy: '#f48fb1',
};

interface CardImagePanelProps {
  src: string;
  alt: string;
  type?: string;
}

export default function CardImagePanel({ src, alt, type }: CardImagePanelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const color = type ? (TYPE_COLORS[type] ?? '#ffffff') : '#ffffff';

  useEffect(() => {
    if (!wrapperRef.current) return;
    animate(wrapperRef.current, {
      translateY: [-30, 0],
      opacity: [0, 1],
      scale: [0.92, 1],
      duration: 600,
      ease: 'easeOutExpo',
    });
  }, []);

  return (
    <div className="relative">
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${color}22 0%, transparent 70%)`,
        }}
      />
      <div ref={wrapperRef} style={{ opacity: 0 }}>
        <Image
          src={src}
          alt={alt}
          width={500}
          height={700}
          className="w-full rounded-2xl shadow-2xl relative z-10"
          priority
        />
      </div>
    </div>
  );
}
