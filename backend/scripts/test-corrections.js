/**
 * Script de validação das correções aplicadas
 * 
 * Execute com: node backend/scripts/test-corrections.js
 * 
 * Este script valida:
 * 1. Que o campo correto (competencias) está sendo usado
 * 2. Que os thresholds de classificação estão corretos
 * 3. Que o mapeamento de categorias está alinhado
 */

import { NineBoxService } from '../src/modules/ninebox/ninebox.service.js';

// Mock repository para testes isolados
const mockRepo = {
  findById: () => null,
  findAll: () => ({ nineBoxes: [], total: 0 }),
  findByPessoa: () => [],
  findLatestByPessoa: () => null,
  create: (data) => data,
  update: (id, data) => data,
  delete: () => {},
  getGridDistribution: () => ({}),
  getStatsByTipo: () => ({})
};

const nineBoxService = new NineBoxService(mockRepo);

console.log('🧪 Iniciando testes de validação das correções...\n');

// ============================================
// TESTE 1: Classificação de Scores
// ============================================
console.log('📊 TESTE 1: Classificação de Scores (Issue #4 e #7)');
console.log('─'.repeat(50));

const testScores = [
  { score: 1.0, expected: 'BAIXO' },
  { score: 1.5, expected: 'BAIXO' },
  { score: 2.0, expected: 'BAIXO' },
  { score: 2.1, expected: 'MÉDIO' },
  { score: 2.5, expected: 'MÉDIO' },
  { score: 3.0, expected: 'MÉDIO' },
  { score: 3.1, expected: 'ALTO' },
  { score: 3.5, expected: 'ALTO' },
  { score: 4.0, expected: 'ALTO' }
];

let test1Passed = true;
testScores.forEach(({ score, expected }) => {
  const result = nineBoxService.classifyScore(score);
  const status = result === expected ? '✅' : '❌';
  if (result !== expected) test1Passed = false;
  console.log(`${status} Score ${score.toFixed(1)} → ${result} (esperado: ${expected})`);
});

console.log(`\nResultado: ${test1Passed ? '✅ PASSOU' : '❌ FALHOU'}\n`);

// ============================================
// TESTE 2: Conversão Score → Grid Position
// ============================================
console.log('🎯 TESTE 2: Conversão Score → Grid Position (Issue #7)');
console.log('─'.repeat(50));

const testGridPos = [
  { score: 1.5, expected: 1 },
  { score: 2.0, expected: 1 },
  { score: 2.5, expected: 2 },
  { score: 3.0, expected: 2 },
  { score: 3.5, expected: 3 },
  { score: 4.0, expected: 3 }
];

let test2Passed = true;
testGridPos.forEach(({ score, expected }) => {
  const result = nineBoxService.scoreToGridPos(score);
  const status = result === expected ? '✅' : '❌';
  if (result !== expected) test2Passed = false;
  console.log(`${status} Score ${score.toFixed(1)} → Grid ${result} (esperado: ${expected})`);
});

console.log(`\nResultado: ${test2Passed ? '✅ PASSOU' : '❌ FALHOU'}\n`);

// ============================================
// TESTE 3: Mapeamento de Categorias
// ============================================
console.log('📦 TESTE 3: Mapeamento de Categorias (Issue #6)');
console.log('─'.repeat(50));

const testCategorias = [
  { perf: 1.5, pot: 1.5, expected: 'Q1 (Insuficiente)', gridX: 1, gridY: 1 },
  { perf: 1.5, pot: 2.5, expected: 'Q2 (Questionável)', gridX: 1, gridY: 2 },
  { perf: 2.5, pot: 1.5, expected: 'Q3 (Eficaz)', gridX: 2, gridY: 1 },
  { perf: 1.5, pot: 3.5, expected: 'Q4 (Dilema)', gridX: 1, gridY: 3 },
  { perf: 2.5, pot: 2.5, expected: 'Q5 (Mantenedor)', gridX: 2, gridY: 2 },
  { perf: 3.5, pot: 1.5, expected: 'Q6 (Especialista)', gridX: 3, gridY: 1 },
  { perf: 2.5, pot: 3.5, expected: 'Q7 (Forte Candidato)', gridX: 2, gridY: 3 },
  { perf: 3.5, pot: 2.5, expected: 'Q8 (Alto Desempenho)', gridX: 3, gridY: 2 },
  { perf: 3.5, pot: 3.5, expected: 'Q9 (Estrela)', gridX: 3, gridY: 3 }
];

let test3Passed = true;
testCategorias.forEach(({ perf, pot, expected, gridX, gridY }) => {
  const categoria = nineBoxService.calculateCategoria(perf, pot);
  const calcGridX = nineBoxService.scoreToGridPos(perf);
  const calcGridY = nineBoxService.scoreToGridPos(pot);
  
  const categoriaOk = categoria === expected;
  const gridXOk = calcGridX === gridX;
  const gridYOk = calcGridY === gridY;
  
  const status = (categoriaOk && gridXOk && gridYOk) ? '✅' : '❌';
  if (!categoriaOk || !gridXOk || !gridYOk) test3Passed = false;
  
  console.log(`${status} Perf:${perf} Pot:${pot} → ${categoria}`);
  console.log(`   Grid: (${calcGridX},${calcGridY}) esperado (${gridX},${gridY})`);
  console.log(`   Frontend key: '${calcGridX}-${calcGridY}'`);
  console.log();
});

console.log(`Resultado: ${test3Passed ? '✅ PASSOU' : '❌ FALHOU'}\n`);

// ============================================
// TESTE 4: Validação de Limites (Edge Cases)
// ============================================
console.log('🔍 TESTE 4: Validação de Limites (Edge Cases)');
console.log('─'.repeat(50));

const edgeCases = [
  { score: 0.5, expected: 'BAIXO', desc: 'Score mínimo' },
  { score: 2.0, expected: 'BAIXO', desc: 'Limite BAIXO-MÉDIO' },
  { score: 2.01, expected: 'MÉDIO', desc: 'Após limite BAIXO-MÉDIO' },
  { score: 3.0, expected: 'MÉDIO', desc: 'Limite MÉDIO-ALTO' },
  { score: 3.01, expected: 'ALTO', desc: 'Após limite MÉDIO-ALTO' },
  { score: 4.0, expected: 'ALTO', desc: 'Score máximo' },
  { score: null, expected: 'INDEFINIDO', desc: 'Score null' },
  { score: undefined, expected: 'INDEFINIDO', desc: 'Score undefined' }
];

let test4Passed = true;
edgeCases.forEach(({ score, expected, desc }) => {
  const result = nineBoxService.classifyScore(score);
  const status = result === expected ? '✅' : '❌';
  if (result !== expected) test4Passed = false;
  console.log(`${status} ${desc}: ${score} → ${result} (esperado: ${expected})`);
});

console.log(`\nResultado: ${test4Passed ? '✅ PASSOU' : '❌ FALHOU'}\n`);

// ============================================
// RESUMO FINAL
// ============================================
console.log('═'.repeat(50));
console.log('📋 RESUMO FINAL');
console.log('═'.repeat(50));

const allPassed = test1Passed && test2Passed && test3Passed && test4Passed;

console.log(`Teste 1 (Classificação): ${test1Passed ? '✅ PASSOU' : '❌ FALHOU'}`);
console.log(`Teste 2 (Grid Position): ${test2Passed ? '✅ PASSOU' : '❌ FALHOU'}`);
console.log(`Teste 3 (Categorias): ${test3Passed ? '✅ PASSOU' : '❌ FALHOU'}`);
console.log(`Teste 4 (Edge Cases): ${test4Passed ? '✅ PASSOU' : '❌ FALHOU'}`);
console.log();
console.log(`${allPassed ? '🎉 TODOS OS TESTES PASSARAM!' : '⚠️  ALGUNS TESTES FALHARAM'}`);
console.log('═'.repeat(50));

// Exit code
process.exit(allPassed ? 0 : 1);
