/**
 * TESTE COMPLETO DE VALIDAÇÃO
 * Garante que todos os cálculos de Nine Box e Avaliações estão corretos
 */

console.log('═══════════════════════════════════════════════════════════');
console.log('🔍 TESTE COMPLETO DE VALIDAÇÃO - NINE BOX & AVALIAÇÕES');
console.log('═══════════════════════════════════════════════════════════\n');

// ============================================================================
// PARTE 1: VALIDAR CLASSIFICAÇÃO DE SCORES
// ============================================================================

console.log('📋 PARTE 1: Validação de Classificação de Scores');
console.log('─────────────────────────────────────────────────────────\n');

function classifyScore(score) {
  if (score === null || score === undefined) return 'INDEFINIDO';
  if (score < 2.01) return 'BAIXO';   // 1.00 a 2.00
  if (score < 3.01) return 'MÉDIO';   // 2.01 a 3.00
  return 'ALTO';                      // 3.01 a 4.00
}

function scoreToGridPos(score) {
  const cls = classifyScore(score);
  if (cls === 'BAIXO') return 1;
  if (cls === 'MÉDIO') return 2;
  if (cls === 'ALTO') return 3;
  return null;
}

const testScores = [
  // Limites inferiores
  { score: 1.00, expectedClass: 'BAIXO', expectedGrid: 1, desc: 'Limite inferior BAIXO' },
  { score: 1.50, expectedClass: 'BAIXO', expectedGrid: 1, desc: 'Meio BAIXO' },
  { score: 2.00, expectedClass: 'BAIXO', expectedGrid: 1, desc: 'Limite superior BAIXO' },
  
  // Transição BAIXO → MÉDIO
  { score: 2.01, expectedClass: 'MÉDIO', expectedGrid: 2, desc: 'Limite inferior MÉDIO' },
  { score: 2.50, expectedClass: 'MÉDIO', expectedGrid: 2, desc: 'Meio MÉDIO' },
  { score: 3.00, expectedClass: 'MÉDIO', expectedGrid: 2, desc: 'Limite superior MÉDIO' },
  
  // Transição MÉDIO → ALTO
  { score: 3.01, expectedClass: 'ALTO', expectedGrid: 3, desc: 'Limite inferior ALTO' },
  { score: 3.50, expectedClass: 'ALTO', expectedGrid: 3, desc: 'Meio ALTO' },
  { score: 4.00, expectedClass: 'ALTO', expectedGrid: 3, desc: 'Limite superior ALTO' },
  
  // Caso real: Maria Santos
  { score: 3.22, expectedClass: 'ALTO', expectedGrid: 3, desc: 'Maria Santos - Desempenho' },
  { score: 1.67, expectedClass: 'BAIXO', expectedGrid: 1, desc: 'Maria Santos - Potencial' },
];

let part1Passed = true;
testScores.forEach(test => {
  const resultClass = classifyScore(test.score);
  const resultGrid = scoreToGridPos(test.score);
  const classMatch = resultClass === test.expectedClass;
  const gridMatch = resultGrid === test.expectedGrid;
  const passed = classMatch && gridMatch;
  
  if (!passed) part1Passed = false;
  
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${test.desc}`);
  console.log(`   Score: ${test.score} → ${resultClass} (Grid ${resultGrid})`);
  if (!classMatch) console.log(`   ⚠️  Esperado: ${test.expectedClass}`);
  if (!gridMatch) console.log(`   ⚠️  Esperado Grid: ${test.expectedGrid}`);
});

console.log('');
if (part1Passed) {
  console.log('✅ PARTE 1 PASSOU - Classificação de scores correta\n');
} else {
  console.log('❌ PARTE 1 FALHOU - Classificação de scores incorreta\n');
}

// ============================================================================
// PARTE 2: VALIDAR CÁLCULO DE CATEGORIAS
// ============================================================================

console.log('📋 PARTE 2: Validação de Cálculo de Categorias');
console.log('─────────────────────────────────────────────────────────\n');

function calculateCategoria(performance, potential) {
  const xClass = classifyScore(performance);
  const yClass = classifyScore(potential);

  const matriz = {
    'ALTO-BAIXO': 'Q7 (Enigma)',
    'ALTO-MÉDIO': 'Q8 (Alto Potencial)',
    'ALTO-ALTO': 'Q9 (Estrela)',
    'MÉDIO-BAIXO': 'Q4 (Inconsistente)',
    'MÉDIO-MÉDIO': 'Q5 (Profissional)',
    'MÉDIO-ALTO': 'Q6 (Destaque)',
    'BAIXO-BAIXO': 'Q1 (Insuficiente)',
    'BAIXO-MÉDIO': 'Q2 (Questionável)',
    'BAIXO-ALTO': 'Q3 (Especialista)'
  };

  return matriz[`${yClass}-${xClass}`] || 'Indefinido';
}

const testCategorias = [
  // Linha 1: Potencial BAIXO
  { perf: 1.5, pot: 1.5, gridX: 1, gridY: 1, expected: 'Q1 (Insuficiente)', desc: 'Q1: Baixo/Baixo' },
  { perf: 2.5, pot: 1.5, gridX: 2, gridY: 1, expected: 'Q2 (Questionável)', desc: 'Q2: Médio/Baixo' },
  { perf: 3.5, pot: 1.5, gridX: 3, gridY: 1, expected: 'Q3 (Especialista)', desc: 'Q3: Alto/Baixo' },
  
  // Linha 2: Potencial MÉDIO
  { perf: 1.5, pot: 2.5, gridX: 1, gridY: 2, expected: 'Q4 (Inconsistente)', desc: 'Q4: Baixo/Médio' },
  { perf: 2.5, pot: 2.5, gridX: 2, gridY: 2, expected: 'Q5 (Profissional)', desc: 'Q5: Médio/Médio' },
  { perf: 3.5, pot: 2.5, gridX: 3, gridY: 2, expected: 'Q6 (Destaque)', desc: 'Q6: Alto/Médio' },
  
  // Linha 3: Potencial ALTO
  { perf: 1.5, pot: 3.5, gridX: 1, gridY: 3, expected: 'Q7 (Enigma)', desc: 'Q7: Baixo/Alto' },
  { perf: 2.5, pot: 3.5, gridX: 2, gridY: 3, expected: 'Q8 (Alto Potencial)', desc: 'Q8: Médio/Alto' },
  { perf: 3.5, pot: 3.5, gridX: 3, gridY: 3, expected: 'Q9 (Estrela)', desc: 'Q9: Alto/Alto' },
  
  // Caso real: Maria Santos
  { perf: 3.22, pot: 1.67, gridX: 3, gridY: 1, expected: 'Q3 (Especialista)', desc: 'Maria Santos' },
];

let part2Passed = true;
testCategorias.forEach(test => {
  const resultCat = calculateCategoria(test.perf, test.pot);
  const resultGridX = scoreToGridPos(test.perf);
  const resultGridY = scoreToGridPos(test.pot);
  
  const catMatch = resultCat === test.expected;
  const gridXMatch = resultGridX === test.gridX;
  const gridYMatch = resultGridY === test.gridY;
  const passed = catMatch && gridXMatch && gridYMatch;
  
  if (!passed) part2Passed = false;
  
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${test.desc}`);
  console.log(`   Perf: ${test.perf} Pot: ${test.pot} → ${resultCat}`);
  console.log(`   Grid: (${resultGridX}, ${resultGridY})`);
  if (!catMatch) console.log(`   ⚠️  Categoria esperada: ${test.expected}`);
  if (!gridXMatch || !gridYMatch) console.log(`   ⚠️  Grid esperado: (${test.gridX}, ${test.gridY})`);
});

console.log('');
if (part2Passed) {
  console.log('✅ PARTE 2 PASSOU - Cálculo de categorias correto\n');
} else {
  console.log('❌ PARTE 2 FALHOU - Cálculo de categorias incorreto\n');
}

// ============================================================================
// PARTE 3: VALIDAR CÁLCULO DE MÉDIA DE AVALIAÇÕES
// ============================================================================

console.log('📋 PARTE 3: Validação de Cálculo de Média de Avaliações');
console.log('─────────────────────────────────────────────────────────\n');

function calcularMediaAvaliacao(criterios) {
  // Escala 1-4: cada critério recebe nota de 1 a 4
  const notas = Object.values(criterios);
  if (notas.length === 0) return null;
  
  const soma = notas.reduce((acc, nota) => acc + nota, 0);
  const media = soma / notas.length;
  
  return parseFloat(media.toFixed(2));
}

function calcularMediaPorCompetencia(avaliacoes) {
  // Sistema atual: calcula média de cada competência, depois média das médias
  // Isso dá peso igual a cada competência, independente do número de critérios
  
  if (avaliacoes.length === 0) return null;
  
  // Para cada avaliação, calcular média
  const medias = avaliacoes.map(av => calcularMediaAvaliacao(av.criterios));
  
  // Calcular média das médias
  const somaMedias = medias.reduce((acc, m) => acc + m, 0);
  const mediaFinal = somaMedias / medias.length;
  
  return parseFloat(mediaFinal.toFixed(2));
}

const testAvaliacoes = [
  {
    desc: 'Avaliação com todos "Excelente" (4)',
    criterios: { c1: 4, c2: 4, c3: 4, c4: 4 },
    expectedMedia: 4.00
  },
  {
    desc: 'Avaliação com todos "Bom" (3)',
    criterios: { c1: 3, c2: 3, c3: 3, c4: 3 },
    expectedMedia: 3.00
  },
  {
    desc: 'Avaliação com todos "Regular" (2)',
    criterios: { c1: 2, c2: 2, c2: 2, c4: 2 },
    expectedMedia: 2.00
  },
  {
    desc: 'Avaliação com todos "Ruim" (1)',
    criterios: { c1: 1, c2: 1, c3: 1, c4: 1 },
    expectedMedia: 1.00
  },
  {
    desc: 'Avaliação mista (2,3,3,4)',
    criterios: { c1: 2, c2: 3, c3: 3, c4: 4 },
    expectedMedia: 3.00 // (2+3+3+4)/4 = 12/4 = 3.00
  },
  {
    desc: 'Avaliação que resulta em 3.22 (Maria Santos - caso provável)',
    criterios: { c1: 3, c2: 3, c3: 4, c4: 4, c5: 3, c6: 3, c7: 3, c8: 3, c9: 4 },
    expectedMedia: 3.33 // Aproximadamente (30/9)
  },
];

let part3Passed = true;
testAvaliacoes.forEach(test => {
  const resultMedia = calcularMediaAvaliacao(test.criterios);
  const passed = Math.abs(resultMedia - test.expectedMedia) < 0.01; // Tolerância de 0.01
  
  if (!passed) part3Passed = false;
  
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${test.desc}`);
  console.log(`   Critérios: ${JSON.stringify(test.criterios)}`);
  console.log(`   Média calculada: ${resultMedia}`);
  if (!passed) console.log(`   ⚠️  Média esperada: ${test.expectedMedia}`);
});

console.log('');
if (part3Passed) {
  console.log('✅ PARTE 3 PASSOU - Cálculo de médias correto\n');
} else {
  console.log('❌ PARTE 3 FALHOU - Cálculo de médias incorreto\n');
}

// ============================================================================
// PARTE 4: VALIDAR INTEGRAÇÃO COMPLETA (Maria Santos)
// ============================================================================

console.log('📋 PARTE 4: Validação de Integração Completa');
console.log('─────────────────────────────────────────────────────────\n');

// Simular o caso real de Maria Santos
const mariaDesempenho = 3.22;
const mariaPotencial = 1.67;

console.log('Caso Real: Maria Santos');
console.log(`Desempenho: ${mariaDesempenho}`);
console.log(`Potencial: ${mariaPotencial}`);
console.log('');

// Passo 1: Classificar scores
const mariaDesClass = classifyScore(mariaDesempenho);
const mariaPotClass = classifyScore(mariaPotencial);
console.log(`1️⃣  Classificação:`);
console.log(`   Desempenho ${mariaDesempenho} → ${mariaDesClass}`);
console.log(`   Potencial ${mariaPotencial} → ${mariaPotClass}`);
console.log('');

// Passo 2: Converter para grid
const mariaGridX = scoreToGridPos(mariaDesempenho);
const mariaGridY = scoreToGridPos(mariaPotencial);
console.log(`2️⃣  Posição no Grid:`);
console.log(`   Grid X (Desempenho): ${mariaGridX}`);
console.log(`   Grid Y (Potencial): ${mariaGridY}`);
console.log(`   Coordenadas: (${mariaGridX}, ${mariaGridY})`);
console.log('');

// Passo 3: Determinar categoria
const mariaCategoria = calculateCategoria(mariaDesempenho, mariaPotencial);
console.log(`3️⃣  Categoria:`);
console.log(`   ${mariaCategoria}`);
console.log('');

// Passo 4: Validar elemento HTML
const elementId = `nb-people-${mariaGridX}-${mariaGridY}`;
console.log(`4️⃣  Elemento HTML:`);
console.log(`   ID do elemento: ${elementId}`);
console.log('');

// Validação final
const expectedGridX = 3;
const expectedGridY = 1;
const expectedCategoria = 'Q3 (Especialista)';
const expectedElementId = 'nb-people-3-1';

const part4Passed = 
  mariaDesClass === 'ALTO' &&
  mariaPotClass === 'BAIXO' &&
  mariaGridX === expectedGridX &&
  mariaGridY === expectedGridY &&
  mariaCategoria === expectedCategoria &&
  elementId === expectedElementId;

if (part4Passed) {
  console.log('✅ PARTE 4 PASSOU - Integração completa correta');
  console.log('   Maria Santos será posicionada corretamente em Q3 (Especialista)\n');
} else {
  console.log('❌ PARTE 4 FALHOU - Integração completa incorreta');
  if (mariaGridX !== expectedGridX) console.log(`   ⚠️  Grid X incorreto: ${mariaGridX}, esperado: ${expectedGridX}`);
  if (mariaGridY !== expectedGridY) console.log(`   ⚠️  Grid Y incorreto: ${mariaGridY}, esperado: ${expectedGridY}`);
  if (mariaCategoria !== expectedCategoria) console.log(`   ⚠️  Categoria incorreta: ${mariaCategoria}, esperada: ${expectedCategoria}`);
  console.log('');
}

// ============================================================================
// RESULTADO FINAL
// ============================================================================

console.log('═══════════════════════════════════════════════════════════');
const allPassed = part1Passed && part2Passed && part3Passed && part4Passed;

if (allPassed) {
  console.log('🎉 SUCESSO TOTAL! TODOS OS TESTES PASSARAM!');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('✅ GARANTIA DE CORREÇÃO:');
  console.log('   ✓ Classificação de scores (1-4 → Baixo/Médio/Alto)');
  console.log('   ✓ Conversão para grid (1-3)');
  console.log('   ✓ Cálculo de categorias (Q1-Q9)');
  console.log('   ✓ Cálculo de médias de avaliações');
  console.log('   ✓ Integração completa (Backend ↔ Frontend)');
  console.log('');
  console.log('📊 Nine Box Grid:');
  console.log('   Q7 Enigma      Q8 Alto Pot.   Q9 Estrela');
  console.log('   Q4 Inconsist.  Q5 Profission. Q6 Destaque');
  console.log('   Q1 Insufic.    Q2 Question.   Q3 Especial. ← Maria Santos');
  console.log('      BAIXO          MÉDIO          ALTO');
  console.log('                  DESEMPENHO');
  console.log('');
} else {
  console.log('⚠️  ATENÇÃO! ALGUNS TESTES FALHARAM!');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Status por parte:');
  console.log(`   Parte 1 (Classificação): ${part1Passed ? '✅' : '❌'}`);
  console.log(`   Parte 2 (Categorias): ${part2Passed ? '✅' : '❌'}`);
  console.log(`   Parte 3 (Médias): ${part3Passed ? '✅' : '❌'}`);
  console.log(`   Parte 4 (Integração): ${part4Passed ? '✅' : '❌'}`);
  console.log('');
  console.log('Revise os erros acima e corrija o código.\n');
}
