import https from 'https';
import fs from 'fs';
import path from 'path';

/**
 * Script para baixar os ícones de recursos necessários do Albion Online
 * Este script verifica quais ícones estão faltando e tenta baixá-los de um repositório externo
 */

const iconBaseUrl = 'https://render.albiononline.com/v1/item/';
const iconsDirectory = path.resolve(process.cwd(), 'public/icons');

// Define os ícones necessários e seus IDs no Albion Online
const iconMapping = {
  'chest_blue.png': 'T2_RANDOM_DUNGEON_TOKEN',
  'chest_green.png': 'T5_RANDOM_DUNGEON_TOKEN',
  'chest_gold.png': 'T8_RANDOM_DUNGEON_TOKEN',
  'resource_stone.png': 'T4_ROCK',
  'resource_wood.png': 'T4_WOOD',
  'resource_ore.png': 'T4_ORE',
  'resource_hide.png': 'T4_HIDE',
  'resource_fiber.png': 'T4_FIBER',
  'dungeon_solo.png': 'T5_RANDOM_DUNGEON_SOLO_TOKEN',
  'dungeon_group.png': 'T5_RANDOM_DUNGEON_TOKEN',
  'resource_hire.png': 'T4_CAPE'
};

// Verifica se o diretório de ícones existe, se não, cria-o
function checkIconsDirectory() {
  if (!fs.existsSync(iconsDirectory)) {
    fs.mkdirSync(iconsDirectory, { recursive: true });
    console.log(`Diretório de ícones criado: ${iconsDirectory}`);
  }
}

// Verifica quais ícones estão faltando
function getMissingIcons() {
  const missingIcons: Record<string, string> = {};
  
  for (const [iconName, itemId] of Object.entries(iconMapping)) {
    const iconPath = path.join(iconsDirectory, iconName);
    if (!fs.existsSync(iconPath) || fs.statSync(iconPath).size === 0) {
      missingIcons[iconName] = itemId;
    }
  }
  
  return missingIcons;
}

// Baixa um ícone específico
function downloadIcon(iconName: string, itemId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const iconUrl = `${iconBaseUrl}${itemId}.png?quality=1`;
    const iconPath = path.join(iconsDirectory, iconName);
    const file = fs.createWriteStream(iconPath);
    
    https.get(iconUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Falha ao baixar o ícone ${iconName} (status: ${response.statusCode})`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Ícone baixado com sucesso: ${iconName}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(iconPath, () => {});
      reject(err);
    });
  });
}

// Função principal
async function main() {
  try {
    console.log('Verificando diretório de ícones...');
    checkIconsDirectory();
    
    console.log('Verificando ícones faltantes...');
    const missingIcons = getMissingIcons();
    const missingCount = Object.keys(missingIcons).length;
    
    if (missingCount === 0) {
      console.log('Todos os ícones já estão presentes. Nada a fazer.');
      return;
    }
    
    console.log(`Encontrados ${missingCount} ícones faltantes. Iniciando download...`);
    
    for (const [iconName, itemId] of Object.entries(missingIcons)) {
      try {
        await downloadIcon(iconName, itemId);
      } catch (error) {
        console.error(`Erro ao baixar ${iconName}:`, error);
      }
    }
    
    console.log('Download de ícones concluído!');
    
  } catch (error) {
    console.error('Erro durante a execução:', error);
    process.exit(1);
  }
}

// Executa o script
main(); 