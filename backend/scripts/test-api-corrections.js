/**
 * Script de teste da API para validar correções
 * 
 * Este script testa especificamente:
 * - Issue #2: Edição de avaliação (antes crashava)
 * - Issue #6: Cálculo correto do nine-box
 * 
 * Execute com: node backend/scripts/test-api-corrections.js
 * 
 * REQUISITOS:
 * - Backend rodando em http://localhost:3000
 * - Usuário admin criado
 * - Campanhas de desempenho e potencial criadas
 */

const API_URL = 'http://localhost:3000/api';
let authToken = null;

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(endpoint, method = 'GET', body = null, requireAuth = true) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (requireAuth && authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

// ============================================
// TESTE 1: Health Check
// ============================================
async function test1_HealthCheck() {
  log('\n📊 TESTE 1: Health Check', 'cyan');
  log('─'.repeat(50));

  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    
    if (response.ok && data.status === 'ok') {
      log('✅ Backend está respondendo', 'green');
      return true;
    } else {
      log('❌ Backend não está respondendo corretamente', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Erro ao conectar com o backend', 'red');
    log(`   ${error.message}`, 'red');
    log('\n💡 Certifique-se de que o backend está rodando:', 'yellow');
    log('   cd backend && npm run dev', 'yellow');
    return false;
  }
}

// ============================================
// TESTE 2: Login
// ============================================
async function test2_Login() {
  log('\n🔐 TESTE 2: Login', 'cyan');
  log('─'.repeat(50));

  const result = await makeRequest('/users/login', 'POST', {
    email: 'admin@example.com',
    senha: 'admin123'
  }, false);

  if (result.ok && result.data.token) {
    authToken = result.data.token;
    log('✅ Login realizado com sucesso', 'green');
    log(`   Token: ${authToken.substring(0, 20)}...`, 'blue');
    return true;
  } else {
    log('❌ Falha no login', 'red');
    log('   Credenciais testadas: admin@example.com / admin123', 'yellow');
    log('\n💡 Certifique-se de que existe um usuário admin:', 'yellow');
    log('   npm run prisma:seed', 'yellow');
    return false;
  }
}

// ============================================
// TESTE 3: Listar Campanhas
// ============================================
async function test3_ListCampaigns() {
  log('\n📋 TESTE 3: Listar Campanhas', 'cyan');
  log('─'.repeat(50));

  const result = await makeRequest('/campaigns?page=1&limit=10');

  if (result.ok && result.data.campaigns) {
    const campaigns = result.data.campaigns;
    log(`✅ ${campaigns.length} campanhas encontradas`, 'green');
    
    const desempenho = campaigns.filter(c => c.tipoAvaliacao === 'desempenho');
    const potencial = campaigns.filter(c => c.tipoAvaliacao === 'potencial');
    
    log(`   Desempenho: ${desempenho.length}`, 'blue');
    log(`   Potencial: ${potencial.length}`, 'blue');
    
    if (campaigns.length === 0) {
      log('\n⚠️  Nenhuma campanha encontrada', 'yellow');
      log('   Crie campanhas para testar o sistema completo', 'yellow');
    }
    
    return { ok: true, campaigns };
  } else {
    log('❌ Erro ao listar campanhas', 'red');
    return { ok: false };
  }
}

// ============================================
// TESTE 4: Criar Avaliação
// ============================================
async function test4_CreateEvaluation(campaignId, avaliadoId) {
  log('\n📝 TESTE 4: Criar Avaliação', 'cyan');
  log('─'.repeat(50));

  const evaluationData = {
    campaignId,
    avaliadoId,
    criterios: {
      'Liderança': 3.5,
      'Comunicação': 2.8,
      'Trabalho em Equipe': 4.0
    },
    comentario: 'Teste de criação de avaliação'
  };

  const result = await makeRequest('/evaluations', 'POST', evaluationData);

  if (result.ok && result.data.id) {
    log('✅ Avaliação criada com sucesso', 'green');
    log(`   ID: ${result.data.id}`, 'blue');
    log(`   Média calculada: ${result.data.media}`, 'blue');
    
    const expectedMedia = ((3.5 + 2.8 + 4.0) / 3).toFixed(2);
    if (Math.abs(result.data.media - expectedMedia) < 0.01) {
      log(`   ✅ Média correta: ${result.data.media} ≈ ${expectedMedia}`, 'green');
    } else {
      log(`   ⚠️  Média esperada: ${expectedMedia}, obtida: ${result.data.media}`, 'yellow');
    }
    
    return { ok: true, id: result.data.id };
  } else {
    log('❌ Erro ao criar avaliação', 'red');
    if (result.data.message) {
      log(`   ${result.data.message}`, 'yellow');
    }
    return { ok: false };
  }
}

// ============================================
// TESTE 5: Editar Avaliação (CRÍTICO - Issue #2)
// ============================================
async function test5_UpdateEvaluation(evaluationId) {
  log('\n✏️  TESTE 5: Editar Avaliação (Issue #2 - CRÍTICO)', 'cyan');
  log('─'.repeat(50));
  log('Este teste valida a correção do bug que causava crash', 'yellow');

  const updateData = {
    criterios: {
      'Liderança': 4.0,
      'Comunicação': 3.2,
      'Trabalho em Equipe': 3.8
    },
    comentario: 'Avaliação atualizada - teste de correção'
  };

  const result = await makeRequest(`/evaluations/${evaluationId}`, 'PUT', updateData);

  if (result.ok) {
    log('✅ CORREÇÃO VALIDADA: Edição funcionou sem crash!', 'green');
    log(`   Nova média: ${result.data.media}`, 'blue');
    
    const expectedMedia = ((4.0 + 3.2 + 3.8) / 3).toFixed(2);
    log(`   Média esperada: ${expectedMedia}`, 'blue');
    
    if (Math.abs(result.data.media - expectedMedia) < 0.01) {
      log('   ✅ Média recalculada corretamente', 'green');
    }
    
    return { ok: true };
  } else {
    log('❌ FALHA: Edição ainda não funciona', 'red');
    if (result.data.message) {
      log(`   Erro: ${result.data.message}`, 'red');
    }
    
    if (result.data.message?.includes('criterios')) {
      log('\n⚠️  Possível problema com validação de critérios', 'yellow');
      log('   Verifique se campaign.competencias está correto', 'yellow');
    }
    
    return { ok: false };
  }
}

// ============================================
// TESTE 6: Calcular Nine-Box (Issue #6)
// ============================================
async function test6_CalculateNineBox() {
  log('\n📊 TESTE 6: Calcular Nine-Box (Issue #6)', 'cyan');
  log('─'.repeat(50));

  const result = await makeRequest('/ninebox/calculate/all');

  if (result.ok && result.data.team) {
    const team = result.data.team;
    log(`✅ Nine-Box calculado para ${team.length} pessoas`, 'green');
    
    // Verificar mapeamento de categorias
    const categoriasEncontradas = new Set();
    team.forEach(nb => {
      categoriasEncontradas.add(nb.categoria);
      
      // Validar que gridX e gridY correspondem aos scores
      const expectedGridX = nb.performance <= 2.0 ? 1 : nb.performance <= 3.0 ? 2 : 3;
      const expectedGridY = nb.potential <= 2.0 ? 1 : nb.potential <= 3.0 ? 2 : 3;
      
      if (nb.gridX !== expectedGridX || nb.gridY !== expectedGridY) {
        log(`   ⚠️  ${nb.pessoa.nome}: Grid incorreto`, 'yellow');
        log(`      Esperado: (${expectedGridX},${expectedGridY}), obtido: (${nb.gridX},${nb.gridY})`, 'yellow');
      }
    });
    
    log('\n   Categorias encontradas:', 'blue');
    [...categoriasEncontradas].sort().forEach(cat => {
      log(`   • ${cat}`, 'blue');
    });
    
    // Verificar alguns mapeamentos específicos
    const testCases = [
      { gridX: 1, gridY: 1, expected: 'Q1 (Insuficiente)' },
      { gridX: 3, gridY: 3, expected: 'Q9 (Estrela)' },
      { gridX: 2, gridY: 2, expected: 'Q5 (Mantenedor)' }
    ];
    
    log('\n   Validação de mapeamentos:', 'blue');
    testCases.forEach(({ gridX, gridY, expected }) => {
      const found = team.find(nb => nb.gridX === gridX && nb.gridY === gridY);
      if (found) {
        if (found.categoria === expected) {
          log(`   ✅ Grid (${gridX},${gridY}) = ${expected}`, 'green');
        } else {
          log(`   ❌ Grid (${gridX},${gridY}) = ${found.categoria}, esperado ${expected}`, 'red');
        }
      }
    });
    
    return { ok: true, team };
  } else {
    log('❌ Erro ao calcular Nine-Box', 'red');
    if (result.data.message) {
      log(`   ${result.data.message}`, 'yellow');
    }
    return { ok: false };
  }
}

// ============================================
// TESTE 7: Verificar Thresholds (Issue #7)
// ============================================
async function test7_VerifyThresholds() {
  log('\n🎯 TESTE 7: Verificar Thresholds (Issue #7)', 'cyan');
  log('─'.repeat(50));
  log('Verificando se scores são classificados corretamente', 'yellow');

  const result = await makeRequest('/ninebox/calculate/all');

  if (result.ok && result.data.team) {
    const team = result.data.team;
    let allCorrect = true;

    team.forEach(nb => {
      // Validar performance
      const perfClass = nb.performance <= 2.0 ? 'BAIXO' : nb.performance <= 3.0 ? 'MÉDIO' : 'ALTO';
      const perfGrid = nb.performance <= 2.0 ? 1 : nb.performance <= 3.0 ? 2 : 3;
      
      // Validar potential
      const potClass = nb.potential <= 2.0 ? 'BAIXO' : nb.potential <= 3.0 ? 'MÉDIO' : 'ALTO';
      const potGrid = nb.potential <= 2.0 ? 1 : nb.potential <= 3.0 ? 2 : 3;
      
      if (nb.gridX !== perfGrid || nb.gridY !== potGrid) {
        allCorrect = false;
        log(`   ❌ ${nb.pessoa.nome}:`, 'red');
        log(`      Performance ${nb.performance} (${perfClass}) → esperado grid ${perfGrid}, obtido ${nb.gridX}`, 'yellow');
        log(`      Potential ${nb.potential} (${potClass}) → esperado grid ${potGrid}, obtido ${nb.gridY}`, 'yellow');
      }
    });

    if (allCorrect) {
      log('✅ Todos os thresholds estão corretos!', 'green');
      log('   ≤2.0 = BAIXO (grid 1)', 'blue');
      log('   ≤3.0 = MÉDIO (grid 2)', 'blue');
      log('   >3.0 = ALTO (grid 3)', 'blue');
      return { ok: true };
    } else {
      log('❌ Alguns thresholds estão incorretos', 'red');
      return { ok: false };
    }
  } else {
    log('⚠️  Não foi possível verificar thresholds (sem dados)', 'yellow');
    return { ok: false };
  }
}

// ============================================
// EXECUTAR TODOS OS TESTES
// ============================================
async function runAllTests() {
  log('═'.repeat(50), 'cyan');
  log('🧪 TESTES DE VALIDAÇÃO DAS CORREÇÕES', 'cyan');
  log('═'.repeat(50), 'cyan');

  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
    test5: false,
    test6: false,
    test7: false
  };

  // Teste 1: Health Check
  results.test1 = await test1_HealthCheck();
  if (!results.test1) {
    log('\n❌ Backend não está acessível. Abortando testes.', 'red');
    process.exit(1);
  }

  // Teste 2: Login
  results.test2 = await test2_Login();
  if (!results.test2) {
    log('\n⚠️  Não foi possível fazer login. Alguns testes serão ignorados.', 'yellow');
  }

  // Teste 3: Listar Campanhas
  const campaignsResult = await test3_ListCampaigns();
  results.test3 = campaignsResult.ok;

  // Testes 4-5: Criar e Editar Avaliação (requerem campanha)
  if (results.test2 && results.test3 && campaignsResult.campaigns?.length > 0) {
    const campaign = campaignsResult.campaigns[0];
    
    // Precisamos de um usuário para avaliar
    const usersResult = await makeRequest('/users?page=1&limit=10');
    if (usersResult.ok && usersResult.data.users?.length > 0) {
      const userToEvaluate = usersResult.data.users.find(u => u.tipo === 'colaborador') || usersResult.data.users[0];
      
      // Teste 4: Criar Avaliação
      const createResult = await test4_CreateEvaluation(campaign.id, userToEvaluate.id);
      results.test4 = createResult.ok;
      
      // Teste 5: Editar Avaliação (CRÍTICO)
      if (createResult.ok) {
        const updateResult = await test5_UpdateEvaluation(createResult.id);
        results.test5 = updateResult.ok;
      }
    } else {
      log('\n⚠️  Nenhum usuário encontrado para testar avaliações', 'yellow');
    }
  } else {
    log('\n⚠️  Testes 4-5 ignorados (sem campanhas ou sem autenticação)', 'yellow');
  }

  // Teste 6: Calcular Nine-Box
  if (results.test2) {
    const nineBoxResult = await test6_CalculateNineBox();
    results.test6 = nineBoxResult.ok;
  }

  // Teste 7: Verificar Thresholds
  if (results.test2) {
    const thresholdsResult = await test7_VerifyThresholds();
    results.test7 = thresholdsResult.ok;
  }

  // Resumo
  log('\n═'.repeat(50), 'cyan');
  log('📋 RESUMO DOS TESTES', 'cyan');
  log('═'.repeat(50), 'cyan');

  const testNames = [
    'Health Check',
    'Login',
    'Listar Campanhas',
    'Criar Avaliação',
    'Editar Avaliação (Issue #2 - CRÍTICO)',
    'Calcular Nine-Box (Issue #6)',
    'Verificar Thresholds (Issue #7)'
  ];

  Object.entries(results).forEach(([key, passed], index) => {
    const status = passed ? '✅ PASSOU' : '❌ FALHOU';
    const color = passed ? 'green' : 'red';
    log(`${status} - ${testNames[index]}`, color);
  });

  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  log('\n' + '═'.repeat(50), 'cyan');
  log(`Total: ${totalPassed}/${totalTests} testes passaram`, totalPassed === totalTests ? 'green' : 'yellow');
  log('═'.repeat(50), 'cyan');

  // Exit code
  process.exit(totalPassed === totalTests ? 0 : 1);
}

// Executar
runAllTests().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
