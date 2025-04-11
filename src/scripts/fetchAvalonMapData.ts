import fs from 'fs';
import path from 'path';
import https from 'https';
import type { Map as AvalonMap, ChestItem, DungeonItem, ResourceItem } from '../types/map';

// URLs e caminhos importantes
const AVALON_MAP_URL = 'https://avalonmap.com.br/';
const MAPS_JSON_PATH = path.resolve(process.cwd(), 'src/data/maps.json');
const MAPS_IMAGE_DIR = path.resolve(process.cwd(), 'public/maps');

// Tipos e interfaces
interface AvalonMapData {
  maps: AvalonMap[];
  lastUpdated: string;
}

interface ExternalMapData {
  name: string;
  tier: number;
  resources: string[];
  imageUrl: string;
}

/**
 * Lê os dados atuais do JSON de mapas
 */
async function readCurrentMapData(): Promise<AvalonMapData> {
  try {
    const data = fs.readFileSync(MAPS_JSON_PATH, 'utf-8');
    return JSON.parse(data) as AvalonMapData;
  } catch (error) {
    console.error('Erro ao ler o arquivo de mapas:', error);
    return { maps: [], lastUpdated: new Date().toISOString() };
  }
}

/**
 * Verifica se o diretório de imagens de mapas existe, se não, cria-o
 */
function checkMapsDirectory() {
  if (!fs.existsSync(MAPS_IMAGE_DIR)) {
    fs.mkdirSync(MAPS_IMAGE_DIR, { recursive: true });
    console.log(`Diretório de mapas criado: ${MAPS_IMAGE_DIR}`);
  }
}

/**
 * Busca dados de mapas do site avalonmap.com.br
 */
async function fetchExternalMapData(): Promise<ExternalMapData[]> {
  return new Promise((resolve, reject) => {
    https.get(AVALON_MAP_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Extrair dados da tabela HTML usando regex
          const maps: ExternalMapData[] = [];
          
          // Regex para encontrar linhas da tabela
          const tableRowRegex = /<tr[^>]*>.*?<td[^>]*>(.*?)<\/td>.*?<td[^>]*>(.*?)<\/td>.*?<td[^>]*>(.*?)<\/td>.*?<td[^>]*>.*?<img[^>]*src="([^"]*)".*?<\/td>.*?<\/tr>/gs;
          let match;
          
          while ((match = tableRowRegex.exec(data)) !== null) {
            const name = match[1].trim();
            const tier = parseInt(match[2].trim(), 10);
            
            // Extrair recursos da coluna de recursos
            const resourcesHtml = match[3];
            const resourcesRegex = /<img[^>]*title="([^"]*)"[^>]*>/g;
            const resources: string[] = [];
            let resourceMatch;
            
            while ((resourceMatch = resourcesRegex.exec(resourcesHtml)) !== null) {
              resources.push(resourceMatch[1].trim());
            }
            
            const imageUrl = match[4].trim();
            
            if (name && tier && imageUrl) {
              maps.push({
                name,
                tier,
                resources,
                imageUrl
              });
            }
          }
          
          console.log(`Encontrados ${maps.length} mapas no site externo.`);
          resolve(maps);
        } catch (error) {
          reject(new Error(`Erro ao processar dados do site: ${error}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Erro ao acessar o site: ${error.message}`));
    });
  });
}

/**
 * Baixa uma imagem de mapa a partir da URL
 */
async function downloadMapImage(url: string, fileName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(MAPS_IMAGE_DIR, fileName);
    
    // Se o arquivo já existe, não baixa novamente
    if (fs.existsSync(filePath)) {
      console.log(`Imagem ${fileName} já existe. Pulando download.`);
      resolve();
      return;
    }
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Falha ao baixar a imagem (status: ${response.statusCode})`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Imagem baixada com sucesso: ${fileName}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

/**
 * Converte recursos externos para o formato interno
 */
function convertResources(resources: string[]): { 
  chests: ChestItem[],
  dungeons: DungeonItem[],
  resources: ResourceItem[]
} {
  const chests: ChestItem[] = [];
  const dungeons: DungeonItem[] = [];
  const resourceItems: ResourceItem[] = [];
  
  // Mapeamento de nomes de recursos externos para tipos internos
  const resourceTypeMap: Record<string, any> = {
    'Baú Verde': { type: 'GREEN', size: 'small', target: chests },
    'Baú Azul': { type: 'BLUE', size: 'small', target: chests },
    'Baú Dourado': { type: 'GOLD', size: 'small', target: chests },
    'Pedra': { type: 'STONE', size: 'small', target: resourceItems },
    'Minério': { type: 'ORE', size: 'small', target: resourceItems },
    'Madeira': { type: 'WOOD', size: 'small', target: resourceItems },
    'Couro': { type: 'HIDE', size: 'small', target: resourceItems },
    'Fibra': { type: 'FIBER', size: 'small', target: resourceItems },
    'Dungeon Solo': { type: 'DUNGEON_SOLO', size: 'small', target: dungeons },
    'Dungeon Grupo': { type: 'DUNGEON_GROUP', size: 'small', target: dungeons }
  };
  
  // Contador para cada tipo de recurso
  const resourceCounts: Record<string, number> = {};
  
  resources.forEach(resource => {
    const mappedResource = resourceTypeMap[resource];
    if (mappedResource) {
      // Incrementa o contador para este tipo de recurso
      resourceCounts[resource] = (resourceCounts[resource] || 0) + 1;
      
      // Verifica se já existe um item deste tipo no array correspondente
      const targetArray = mappedResource.target;
      const existingItem = targetArray.find((item: { type: string }) => 
        item.type === mappedResource.type
      );
      
      if (existingItem) {
        // Se já existe, incrementa o contador
        existingItem.count = (existingItem.count || 0) + 1;
      } else {
        // Se não existe, adiciona um novo item
        targetArray.push({
          type: mappedResource.type,
          size: mappedResource.size,
          count: 1
        });
      }
    }
  });
  
  return { chests, dungeons, resources: resourceItems };
}

/**
 * Gera um novo ID único para um mapa
 */
function generateNewId(existingMaps: AvalonMap[]): number {
  const maxId = existingMaps.reduce((max, map) => Math.max(max, map.id), 0);
  return maxId + 1;
}

/**
 * Processa dados de mapas externos e atualiza nosso JSON
 */
async function processExternalMaps(externalMaps: ExternalMapData[], currentData: AvalonMapData): Promise<AvalonMapData> {
  const updatedData = { ...currentData };
  let newMapsCount = 0;
  
  for (const externalMap of externalMaps) {
    // Verifica se o mapa já existe na nossa base
    const existingMap = currentData.maps.find(map => 
      map.name.toLowerCase() === externalMap.name.toLowerCase()
    );
    
    if (!existingMap) {
      // Se não existe, adiciona como novo mapa
      const imageFileName = `${externalMap.name.replace(/ /g, '-')}_T_${externalMap.tier}.png`;
      
      try {
        // Download da imagem
        await downloadMapImage(externalMap.imageUrl, imageFileName);
        
        // Converte recursos
        const { chests, dungeons, resources } = convertResources(externalMap.resources);
        
        // Cria o novo mapa
        const newMap: AvalonMap = {
          id: generateNewId(updatedData.maps),
          name: externalMap.name,
          tier: externalMap.tier,
          image: imageFileName,
          chests,
          dungeons,
          resources
        };
        
        // Adiciona à lista de mapas
        updatedData.maps.push(newMap);
        newMapsCount++;
        
        console.log(`Novo mapa adicionado: ${newMap.name} (Tier ${newMap.tier})`);
      } catch (error) {
        console.error(`Erro ao processar mapa ${externalMap.name}:`, error);
      }
    }
  }
  
  // Atualiza a data da última atualização
  updatedData.lastUpdated = new Date().toISOString();
  
  console.log(`Processamento concluído. ${newMapsCount} novos mapas adicionados.`);
  return updatedData;
}

/**
 * Salva os dados atualizados de volta ao arquivo JSON
 */
async function saveMapData(data: AvalonMapData): Promise<void> {
  try {
    fs.writeFileSync(MAPS_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Dados salvos com sucesso em ${MAPS_JSON_PATH}`);
  } catch (error) {
    console.error('Erro ao salvar dados dos mapas:', error);
    throw error;
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('🔍 Iniciando busca de mapas do AvalonMap.com.br...');
    
    // Verifica diretório de imagens
    checkMapsDirectory();
    
    // Lê dados atuais
    console.log('📖 Lendo dados atuais dos mapas...');
    const currentData = await readCurrentMapData();
    console.log(`Encontrados ${currentData.maps.length} mapas na base atual.`);
    
    // Busca dados externos
    console.log('🌐 Buscando dados do site externo...');
    const externalMaps = await fetchExternalMapData();
    
    // Processa e atualiza mapas
    console.log('🔄 Processando e integrando novos mapas...');
    const updatedData = await processExternalMaps(externalMaps, currentData);
    
    // Salva dados atualizados
    console.log('💾 Salvando dados atualizados...');
    await saveMapData(updatedData);
    
    console.log('✅ Processo concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
    process.exit(1);
  }
}

// Executa o script
main(); 