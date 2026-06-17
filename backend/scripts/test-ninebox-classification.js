/**
 * Teste de Classificação Nine Box
 * Valida se a lógica de classificação está correta após as correções
 */

// Simular a função classifyScore corrigida
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
  if (cls === 'ALTO')  return 3;
  return null;
}

function calculateCategoria(performance, potential) {
  const xClass = classifyScore(performance);
  const yClass = classifyScore(potential);

  const matriz = {
    'ALTO-BAIXO': 'Q4 (Dilema)',
    'ALTO-MÉDIO': 'Q7 (Forte Candidato)',
    'ALTO-ALTO': 'Q9 (Estrela)',
    'MÉDIO-BAIXO': 'Q2 (Questionável)',
    'MÉDIO-MÉDIO': 'Q5 (Mantenedor)',
    'MÉDIO-ALTO': 'Q8 (Alto Desempenho)',
    'BAIXO-BAIXO': 'Q1 (Insuficiente)',
    'BAIXO-MÉDIO': 'Q3 (Eficaz)',
    'BAIXO-ALTO': 'Q6 (Especialista)'
  };

  return matriz[`${yClass}-${xClass}`] || 'Indefinido';
}

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 TESTE DE CLASSIFICAÇÃO NINE BOX');
console.log('═══════════════════════════════════════════════════════════\n');

// Casos de teste
const testCases = [
  // Limites críticos (onde estava o bug)
  { perf: 2.00, pot: 2.00, expectedPerf: 'BAIXO', expectedPot: 'BAIXO', expectedGrid: [1, 1] },
  { perf: 2.01, pot: 2.01, expectedPerf: 'MÉDIO', expectedPot: 'MÉDIO', expectedGrid: [2, 2] },
  { perf: 3.00, pot: 3.00, expectedPerf: 'MÉDIO', expectedPot: 'MÉDIO', expectedGrid: [2, 2] },
  { perf: 3.01, pot: 3.01, expectedPerf: 'ALTO', expectedPot: 'ALTO', expectedGrid: [3, 3] },
  
  // Caso do usuário
  { perf: 3.22, pot: 1.67, expectedPerf: 'ALTO', expectedPot: 'BAIXO', expectedGrid: [3, 1] },
  
  // Casos extremos
  { perf: 1.00, pot: 1.00, expectedPerf: 'BAIXO', expectedPot: 'BAIXO', expectedGrid: [1, 1] },
  { perf: 4.00, pot: 4.00, expectedPerf: 'ALTO', expectedPot: 'ALTO', expectedGrid: [3, 3] },
  
  // Casos mistos
  { perf: 1.50, pot: 3.50, expectedPerf: 'BAIXO', expectedPot: 'ALTO', expectedGrid: [1, 3] },
  { perf: 3.50, pot: 1.50, expectedPerf: 'ALTO', expectedPot: 'BAIXO', expectedGrid: [3, 1] },
  { perf: 2.50, pot: 2.50, expectedPerf: 'MÉDIO', expectedPot: 'MÉDIO', expectedGrid: [2, 2] },
];

let passedTests = 0;
let failedTests = 0;

testCases.forEach((test, index) => {
  const perfClass = classifyScore(test.perf);
  const potClass = classifyScore(test.pot);
  const perfGrid = scoreToGridPos(test.perf);
  const potGrid = scoreToGridPos(test.pot);
  const categoria = calculateCategoria(test.perf, test.pot);
  
  const perfMatch = perfClass === test.expectedPerf;
  const potMatch = potClass === test.expectedPot;
  const gridMatch = perfGrid === test.expectedGrid[0] && potGrid === test.expectedGrid[1];
  
  const allMatch = perfMatch && potMatch && gridMatch;
  
  if (allMatch) {
    passedTests++;
    console.log(`✅ Teste ${index + 1}: PASSOU`);
  } else {
    failedTests++;
    console.log(`❌ Teste ${index + 1}: FALHOU`);
  }
  
  console.log(`   Perf: ${test.perf} → ${perfClass} (Grid ${perfGrid}) ${perfMatch ? '✓' : '✗ esperado: ' + test.expectedPerf}`);
  console.log(`   Pot:  ${test.pot} → ${potClass} (Grid ${potGrid}) ${potMatch ? '✓' : '✗ esperado: ' + test.expectedPot}`);
  console.log(`   Grid: (${perfGrid}, ${potGrid}) ${gridMatch ? '✓' : '✗ esperado: (' + test.expectedGrid[0] + ', ' + test.expectedGrid[1] + ')'}`);
  console.log(`   Categoria: ${categoria}`);
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════');
console.log(`📊 RESULTADO: ${passedTests}/${testCases.length} testes passaram`);
if (failedTests === 0) {
  console.log('🎉 TODOS OS TESTES PASSARAM! Classificação correta.');
} else {
  console.log(`⚠️  ${failedTests} teste(s) falharam. Verifique a lógica.`);
}
console.log('═══════════════════════════════════════════════════════════\n');

// Teste visual do grid
console.log('🎨 VISUALIZAÇÃO DO GRID NINE BOX\n');
console.log('Potencial │');
console.log('    3     │  Q4 Dilema    │  Q7 Forte     │  Q9 Estrela');
console.log('  (ALTO)  │               │  Candidato    │');
console.log('──────────┼───────────────┼───────────────┼───────────────');
console.log('    2     │  Q2 Quest.    │  Q5 Mantened. │  Q8 Alto Des.');
console.log('  (MÉDIO) │               │               │');
console.log('──────────┼───────────────┼───────────────┼───────────────');
console.log('    1     │  Q1 Insuf.    │  Q3 Eficaz    │  Q6 Especial.');
console.log('  (BAIXO) │               │               │      ← 3.22,1.67');
console.log('──────────┴───────────────┴───────────────┴───────────────');
console.log('              1 (BAIXO)      2 (MÉDIO)      3 (ALTO)');
console.log('                          Desempenho\n');

// Caso específico do usuário
console.log('═══════════════════════════════════════════════════════════');
console.log('📍 CASO DO USUÁRIO: Desempenho 3.22 | Potencial 1.67');
console.log('═══════════════════════════════════════════════════════════');
const userPerf = 3.22;
const userPot = 1.67;
const userPerfClass = classifyScore(userPerf);
const userPotClass = classifyScore(userPot);
const userPerfGrid = scoreToGridPos(userPerf);
const userPotGrid = scoreToGridPos(userPot);
const userCategoria = calculateCategoria(userPerf, userPot);

console.log(`\nDesempenho: ${userPerf}`);
console.log(`  → Classificação: ${userPerfClass}`);
console.log(`  → Grid X: ${userPerfGrid}`);
console.log(`\nPotencial: ${userPot}`);
console.log(`  → Classificação: ${userPotClass}`);
console.log(`  → Grid Y: ${userPotGrid}`);
console.log(`\n🎯 POSIÇÃO FINAL: Grid (${userPerfGrid}, ${userPotGrid})`);
console.log(`📋 CATEGORIA: ${userCategoria}`);
console.log('\n💡 Interpretação:');
console.log('   - Entrega resultados excelentes no cargo atual');
console.log('   - Capacidade limitada de crescimento/promoção');
console.log('   - Perfil "Especialista" ou "Técnico Sênior"');
console.log('   - Ação recomendada: Reconhecimento e trilha de especialização\n');

console.log('═══════════════════════════════════════════════════════════\n');
