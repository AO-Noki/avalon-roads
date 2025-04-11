import type { Map, ChestItem, DungeonItem, ResourceItem, ResourceType } from '../types/map';
import fs from 'fs';
import path from 'path';

// Mapeamento dos tipos antigos para os novos
const resourceTypeMap: Record<string, string> = {
  'ROCK': 'STONE',
  'DUNGEON': 'DUNGEON_SOLO',
  'LOGS': 'WOOD',
  'COTTON': 'FIBER',
  'HIRE': 'HIDE'
};

// Mapeamento dos ícones para os tipos de recursos
const iconTypeMap: Record<string, string> = {
  "T.png": "BLUE",
  "V.png": "GREEN",
  "S.png": "STONE",
  "D.png": "DUNGEON_SOLO",
  "W.png": "WOOD",
  "K.png": "ORE",
  "P.png": "HIDE",
  "M.png": "FIBER",
  "Z.png": "GOLD"
};

// Função para converter o tipo de recurso para o novo padrão
function convertResourceType(type: string): string {
  return resourceTypeMap[type] || type;
}

// Função para extrair dados do HTML do Avalon Map
export async function extractMapData(htmlFilePath: string): Promise<Map[]> {
  // Lê o arquivo HTML
  const html = fs.readFileSync(htmlFilePath, 'utf-8');
  
  // Regex para encontrar o array de dados
  const dataArrayRegex = /const data = \[([\s\S]*?)\];/;
  const match = html.match(dataArrayRegex);
  
  if (!match || !match[1]) {
    throw new Error('Não foi possível encontrar o array de dados no HTML');
  }
  
  // Extrai o conteúdo do array
  const dataString = match[1];
  
  // Dividir o dataString em objetos individuais
  const mapObjects: Map[] = [];
  let id = 1;
  
  // Usar regex para extrair cada objeto de mapa
  const mapRegex = /{[\s\S]*?name: "(.*?)",[\s\S]*?tier: (\d+),[\s\S]*?icons: \[([\s\S]*?)\],[\s\S]*?img: "(.*?)"/g;
  let mapMatch;
  
  while ((mapMatch = mapRegex.exec(dataString)) !== null) {
    const name = mapMatch[1];
    const tier = parseInt(mapMatch[2], 10);
    const iconsString = mapMatch[3];
    const imgPath = mapMatch[4];
    
    // Extrair recursos
    const chests: ChestItem[] = [];
    const dungeons: DungeonItem[] = [];
    const resources: ResourceItem[] = [];
    
    const iconRegex = /{\s*alt:\s*"([^"]+)"(?:,\s*badge:\s*(\d+))?\s*}/g;
    let iconMatch;
    
    while ((iconMatch = iconRegex.exec(iconsString)) !== null) {
      const resourceType = convertResourceType(iconMatch[1]);
      const resourceCount = iconMatch[2] ? parseInt(iconMatch[2], 10) : 1;
      const size = resourceCount > 1 ? 'large' : 'small';
      
      // Determinar o tipo de ícone
      let iconName = '';
      
      if (resourceType.includes('BLUE') || resourceType.includes('GREEN') || resourceType.includes('GOLD')) {
        // É um baú
        iconName = `icons/chest_${resourceType.toLowerCase()}`;
        chests.push({
          type: resourceType as any,
          size,
          icon: iconName,
          count: resourceCount
        });
      } else if (resourceType.includes('DUNGEON')) {
        // É uma dungeon
        iconName = `icons/dungeon_${resourceType.toLowerCase().replace('dungeon_', '')}`;
        dungeons.push({
          type: resourceType as any,
          size,
          icon: iconName,
          count: resourceCount
        });
      } else {
        // É um recurso
        iconName = `icons/resource_${resourceType.toLowerCase()}`;
        resources.push({
          type: resourceType as any,
          size,
          icon: iconName,
          count: resourceCount
        });
      }
    }
    
    // Adicionar o mapa ao array
    mapObjects.push({
      id: id++,
      name,
      tier,
      image: imgPath,
      chests,
      dungeons,
      resources
    });
  }
  
  return mapObjects;
}

// Função para salvar os dados em um arquivo JSON
export async function saveMapData(maps: Map[], outputPath: string): Promise<void> {
  const jsonData = {
    maps,
    lastUpdated: new Date().toISOString()
  };
  
  const jsonString = JSON.stringify(jsonData, null, 2);
  fs.writeFileSync(outputPath, jsonString, 'utf-8');
  
  console.log(`Dados salvos com sucesso em ${outputPath}`);
  console.log(`Total de mapas: ${maps.length}`);
}

// Função para executar a extração e salvamento
export async function extractAndSaveMaps(htmlFilePath: string, outputPath: string): Promise<void> {
  try {
    const maps = await extractMapData(htmlFilePath);
    await saveMapData(maps, outputPath);
  } catch (error) {
    console.error('Erro ao extrair dados dos mapas:', error);
  }
} 