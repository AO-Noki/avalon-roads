import { extractAndSaveMaps } from '../utils/mapExtractor';
import path from 'path';

// Caminho para o arquivo HTML
const htmlFilePath = process.argv[2] || path.resolve(process.cwd(), 'Avalon Map.html');

// Caminho de saída para o arquivo JSON
const outputPath = path.resolve(process.cwd(), 'src/data/maps.json');

// Executa a extração
console.log(`Extraindo dados do arquivo: ${htmlFilePath}`);
console.log(`Salvando em: ${outputPath}`);

extractAndSaveMaps(htmlFilePath, outputPath)
  .then(() => console.log('Extração concluída com sucesso!'))
  .catch(error => console.error('Erro durante a extração:', error)); 