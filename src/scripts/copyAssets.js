import fs from 'node:fs';
import path from 'node:path';

// Função para copiar arquivos recursivamente
function copyFolderRecursiveSync(source, target) {
  // Verifica se a pasta de destino existe, se não, cria
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Lê todos os arquivos/diretórios na pasta de origem
  const files = fs.readdirSync(source);

  // Para cada arquivo/diretório
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    // Verifica se é diretório ou arquivo
    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) {
      // Se for diretório, copia recursivamente
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      // Se for arquivo, copia
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// Função principal
function main() {
  console.log('Copiando assets...');

  const publicDir = path.resolve('public');
  const buildDir = path.resolve('public_html');

  // Copia os ícones
  const iconsSourceDir = path.join(publicDir, 'icons');
  const iconsTargetDir = path.join(buildDir, 'icons');
  if (fs.existsSync(iconsSourceDir)) {
    console.log('Copiando ícones...');
    copyFolderRecursiveSync(iconsSourceDir, iconsTargetDir);
  } else {
    console.log('Pasta de ícones não encontrada:', iconsSourceDir);
  }

  // Copia os mapas
  const mapsSourceDir = path.join(publicDir, 'maps');
  const mapsTargetDir = path.join(buildDir, 'maps');
  if (fs.existsSync(mapsSourceDir)) {
    console.log('Copiando mapas...');
    copyFolderRecursiveSync(mapsSourceDir, mapsTargetDir);
  } else {
    console.log('Pasta de mapas não encontrada:', mapsSourceDir);
  }

  console.log('Assets copiados com sucesso!');
}

main(); 