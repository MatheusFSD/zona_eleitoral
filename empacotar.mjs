/* Empacota o dist num zip para o itch.io.
 *
 * O itch só pede uma coisa do arquivo: index.html na raiz do zip. O
 * Compress-Archive do Windows grava os caminhos com barra invertida e o
 * bsdtar insiste em prefixar tudo com "./" — os dois quebram o carregamento
 * dos assets lá dentro. Então o zip é escrito aqui, entrada por entrada, com
 * o nome exatamente como o navegador vai pedir.
 *
 *   node empacotar.mjs            → secao-127-itch.zip
 */

import { deflateRawSync } from "node:zlib";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ORIGEM = "dist";
const DESTINO = "secao-127-itch.zip";

const TABELA = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = TABELA[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const listar = (dir) =>
  readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? listar(caminho) : [caminho];
  });

const arquivos = listar(ORIGEM);
if (!arquivos.some((f) => relative(ORIGEM, f) === "index.html")) {
  console.error("Não achei o index.html em dist/. Rode `npm run build` antes.");
  process.exit(1);
}

const locais = [];
const central = [];
let deslocamento = 0;

for (const caminho of arquivos) {
  // Barras normais sempre: é assim que o nome vai ser pedido pelo navegador.
  const nome = Buffer.from(relative(ORIGEM, caminho).split("\\").join("/"), "utf8");
  const cru = readFileSync(caminho);
  const comprimido = deflateRawSync(cru, { level: 9 });
  const soma = crc32(cru);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); // PK\3\4
  local.writeUInt16LE(20, 4); // versão mínima
  local.writeUInt16LE(0x800, 6); // nomes em UTF-8
  local.writeUInt16LE(8, 8); // deflate
  local.writeUInt32LE(soma, 14);
  local.writeUInt32LE(comprimido.length, 18);
  local.writeUInt32LE(cru.length, 22);
  local.writeUInt16LE(nome.length, 26);
  locais.push(local, nome, comprimido);

  const entrada = Buffer.alloc(46);
  entrada.writeUInt32LE(0x02014b50, 0); // PK\1\2
  entrada.writeUInt16LE(20, 4);
  entrada.writeUInt16LE(20, 6);
  entrada.writeUInt16LE(0x800, 8);
  entrada.writeUInt16LE(8, 10);
  entrada.writeUInt32LE(soma, 16);
  entrada.writeUInt32LE(comprimido.length, 20);
  entrada.writeUInt32LE(cru.length, 24);
  entrada.writeUInt16LE(nome.length, 28);
  entrada.writeUInt32LE(deslocamento, 42);
  central.push(entrada, nome);

  deslocamento += 30 + nome.length + comprimido.length;
}

const corpoCentral = Buffer.concat(central);
const fim = Buffer.alloc(22);
fim.writeUInt32LE(0x06054b50, 0); // PK\5\6
fim.writeUInt16LE(arquivos.length, 8);
fim.writeUInt16LE(arquivos.length, 10);
fim.writeUInt32LE(corpoCentral.length, 12);
fim.writeUInt32LE(deslocamento, 16);

const zip = Buffer.concat([...locais, corpoCentral, fim]);
writeFileSync(DESTINO, zip);
console.log(`${DESTINO} · ${arquivos.length} arquivos · ${(zip.length / 1048576).toFixed(2)} MB`);
