export interface Set {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: {
    unlimited: string;
    expanded?: string;
  };
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface Card {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  level?: string;
  hp?: string;
  rules?: string[];
  types?: string[];
  evolvesFrom?: string;
  abilities?: {
    name: string;
    text: string;
    type: string;
  }[];
  attacks?: {
    name: string;
    cost?: string[];
    convertedEnergyCost?: number;
    damage?: string;
    text?: string;
  }[];
  weaknesses?: {
    type: string;
    value: string;
  }[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  number?: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities?: {
    unlimited?: string;
    [format: string]: string | undefined;
  };
  images: {
    small: string;
    large: string;
  };
}
