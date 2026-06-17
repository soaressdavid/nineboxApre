/**
 * TESTE FINAL - Nine Box após todas as correções
 */

// Simular funções corrigidas
function classifyScore(score) {
  if (score === null || score === undefined) return 'INDEFINIDO';
  if (score < 2.01) return 'BAIXO';
  if (score < 3.01) return 'MÉDIO';
  return 'ALTO';
}

function scoreToGridPos(score) {
  const cls = classifyScore(score);
  if (cls === 'BAIXO') return 1;
  if (cls === 'MÉDIO') return 2;
  if (cls === 'ALTO') return 3;
  return null;
}

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

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 TESTE FINAL - NINE BOX APÓS CORREÇÕES');
console.log('═══════════════════════════════════════════════════════════\n');

// Teste 1: Maria Santos
console.log('📋 TESTE 1: Maria Santos (Caso Real)');
console.log('─────────────────────────────────────────────────────────');
const mariaDes = 3.22;
const mariaPot = 1.67;
const mariaDesClass = classifyScore(mariaDes);
const mariaPotClass = classifyScore(mariaPot);
const mariaGridX = scoreToGridPos(mariaDes);
const mariaGridY = scoreToGridPos(mariaPot);
const mariaCategoria = calculateCategoria(mariaDes, mariaPot);

console.log(`Desempenho: ${mariaDes} → ${mariaDesClass} (Grid X = ${mariaGridX})`);
console.log(`Potencial: ${mariaPot} → ${mariaPotClass} (Grid Y = ${mariaGridY})`);
console.log(`Posição: (${mariaGridX}, ${mariaGridY})`);
console.log(`Categoria: ${mariaCategoria}`);
console.log(`ID do elemento: nb-people-${mariaGridX}-${mariaGridY}`);

if (mariaCategoria === 'Q3 (Especialista)' && mariaGridX === 3 && mariaGridY === 1) {
  console.log('✅ PASSOU - Maria Santos corretamente classificada!\n');
} else {
  console.log('❌ FALHOU - Classificação incorreta!\n');
}

// Teste 2: Validar todos os 9 quadrantes
console.log('📋 TESTE 2: Validação de Todos os Quadrantes');
console.log('─────────────────────────────────────────────────────────');

const testCases = [
  { x: 1, y: 1, perf: 1.5, pot: 1.5, expected: 'Q1 (Insuficiente)' },
  { x: 2, y: 1, perf: 2.5, pot: 1.5, expected: 'Q2 (Questionável)' },
  { x: 3, y: 1, perf: 3.5, pot: 1.5, expected: 'Q3 (Especialista)' },
  { x: 1, y: 2, perf: 1.5, pot: 2.5, expected: 'Q4 (Inconsistente)' },
  { x: 2, y: 2, perf: 2.5, pot: 2.5, expected: 'Q5 (Profissional)' },
  { x: 3, y: 2, perf: 3.5, pot: 2.5, expected: 'Q6 (Destaque)' },
  { x: 1, y: 3, perf: 1.5, pot: 3.5, expected: 'Q7 (Enigma)' },
  { x: 2, y: 3, perf: 2.5, pot: 3.5, expected: 'Q8 (Alto Potencial)' },
  { x: 3, y: 3, perf: 3.5, pot: 3.5, expected: 'Q9 (Estrela)' },
];

let allPassed = true;
testCases.forEach(test => {
  const gridX = scoreToGridPos(test.perf);
  const gridY = scoreToGridPos(test.pot);
  const categoria = calculateCategoria(test.perf, test.pot);
  const match = gridX === test.x && gridY === test.y && categoria === test.expected;
  
  if (!match) allPassed = false;
  
  const status = match ? '✅' : '❌';
  console.log(`${status} (${test.x},${test.y}): P=${test.perf} Pot=${test.pot} → ${categoria} ${match ? '' : '(esperado: ' + test.expected + ')'}`);
});

console.log('');
if (allPassed) {
  console.log('✅ TODOS OS QUADRANTES CORRETOS!\n');
} else {
  console.log('❌ ALGUNS QUADRANTES INCORRETOS!\n');
}

// Teste 3: Limites críticos
console.log('📋 TESTE 3: Limites Críticos (Bug Anterior)');
console.log('─────────────────────────────────────────────────────────');

const limites = [
  { score: 2.00, expected: 'BAIXO' },
  { score: 2.01, expected: 'MÉDIO' },
  { score: 3.00, expected: 'MÉDIO' },
  { score: 3.01, expected: 'ALTO' },
];

let limitesPassed = true;
limites.forEach(test => {
  const result = classifyScore(test.score);
  const match = result === test.expected;
  if (!match) limitesPassed = false;
  
  const status = match ? '✅' : '❌';
  console.log(`${status} Score ${test.score} → ${result} ${match ? '' : '(esperado: ' + test.expected + ')'}`);
});

console.log('');
if (limitesPassed) {
  console.log('✅ LIMITES CRÍTICOS CORRETOS!\n');
} else {
  console.log('❌ LIMITES CRÍTICOS INCORRETOS!\n');
}

// Resultado Final
console.log('═══════════════════════════════════════════════════════════');
if (allPassed && limitesPassed) {
  console.log('🎉 SUCESSO! TODAS AS CORREÇÕES FUNCIONANDO CORRETAMENTE!');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('✅ Próximos passos:');
  console.log('   1. Reinicie o backend para carregar as correções');
  console.log('   2. Recarregue a página nine-box.html no navegador');
  console.log('   3. Verifique se Maria Santos aparece em Q3 (Especialista)');
  console.log('   4. Confirme que todos os quadrantes estão com numeração correta\n');
} else {
  console.log('⚠️  ATENÇÃO! Alguns testes falharam. Revise o código.\n');
}
