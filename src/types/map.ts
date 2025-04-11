export type ChestType = 'BLUE' | 'GREEN' | 'GOLD';
export type DungeonType = 'DUNGEON_SOLO' | 'DUNGEON_GROUP' | 'DUNGEON_AVALON';
export type ResourceType = 'STONE' | 'WOOD' | 'ORE' | 'HIDE' | 'FIBER';
export type Size = 'small' | 'large';

export interface ChestItem {
  type: ChestType;
  size: Size;
  icon: string;
  count?: number;
}

export interface DungeonItem {
  type: DungeonType;
  size: Size;
  icon: string;
  count?: number;
}

export interface ResourceItem {
  type: ResourceType;
  size: Size;
  icon: string;
  count?: number;
}

export interface Map {
  id: number;
  name: string;
  tier: number;
  image: string;
  chests: ChestItem[];
  dungeons: DungeonItem[];
  resources: ResourceItem[];
}
