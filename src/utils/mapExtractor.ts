import type { Map, ChestItem, DungeonItem, ResourceItem, ResourceType } from '../types/map';
import fs from 'fs';
import path from 'path';

/**
 * Extrai dados de mapas do arquivo HTML do Avalon Map
 * @param htmlFilePath Caminho para o arquivo HTML com dados dos mapas
 * @returns Array de objetos Map com os dados extraídos
 */
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
  
  // Usar regex para extrair cada objeto de mapa
  const mapRegex = /{[\s\S]*?name: "(.*?)",[\s\S]*?tier: (\d+),[\s\S]*?icons: \[([\s\S]*?)\],[\s\S]*?img: "(.*?)"/g;
  const mapObjects: Map[] = [];
  let id = 1;
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
      const resourceType = iconMatch[1];
      const resourceCount = iconMatch[2] ? parseInt(iconMatch[2], 10) : 1;
      const size = resourceCount > 1 ? 'large' : 'small';
      
      // Determinar o tipo de recurso e adicionar ao grupo correto
      if (resourceType.includes('BLUE') || resourceType.includes('GREEN') || resourceType.includes('GOLD')) {
        // É um baú
        chests.push({
          type: resourceType as any,
          size,
          count: resourceCount
        });
      } else if (resourceType.includes('DUNGEON')) {
        // É uma dungeon
        dungeons.push({
          type: resourceType as any,
          size,
          count: resourceCount
        });
      } else {
        // É um recurso
        resources.push({
          type: resourceType as any,
          size,
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
      chests: chests.map(({ type, size, count }) => ({
        type,
        size,
        count
      })),
      dungeons: dungeons.map(({ type, size, count }) => ({
        type,
        size,
        count
      })),
      resources: resources.map(({ type, size, count }) => ({
        type,
        size,
        count
      }))
    });
  }
  
  return mapObjects;
}

/**
 * Salva os dados extraídos em um arquivo JSON
 * @param maps Array de mapas a serem salvos
 * @param outputPath Caminho do arquivo JSON de saída
 */
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

/**
 * Executa todo o processo de extração e salvamento de dados
 * @param htmlFilePath Caminho do arquivo HTML de origem
 * @param outputPath Caminho do arquivo JSON de destino
 */
export async function extractAndSaveMaps(htmlFilePath: string, outputPath: string): Promise<void> {
  try {
    const maps = await extractMapData(htmlFilePath);
    await saveMapData(maps, outputPath);
  } catch (error) {
    console.error('Erro ao extrair dados dos mapas:', error);
  }
} 