/**
 * Seed rápido usando SQL direto para evitar timeouts
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function main() {
  // Conectar usando DIRECT_URL para evitar pooler
  const client = new Client({
    connectionString: process.env.DIRECT_URL
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco\n');

    const senhaHash = await bcrypt.hash('admin123', 10);

    // 1. Limpar dados antigos de teste
    console.log('🗑️  Limpando dados de teste...');
    await client.query(`
      DELETE FROM evaluations WHERE "campaignId" IN (
        SELECT id FROM evaluation_campaigns WHERE id LIKE '%test%'
      );
      DELETE FROM campaign_competencies WHERE "campaignId" IN (
        SELECT id FROM evaluation_campaigns WHERE id LIKE '%test%'
      );
      DELETE FROM campaign_gestor_colaboradores WHERE "campaignGestorId" IN (
        SELECT id FROM campaign_gestores WHERE "campaignId" LIKE '%test%'
      );
      DELETE FROM campaign_gestores WHERE "campaignId" LIKE '%test%';
      DELETE FROM evaluation_campaigns WHERE id LIKE '%test%';
      DELETE FROM gestor_colaborador WHERE "gestorId" IN (
        SELECT id FROM users WHERE email LIKE '%@test.com' OR email = 'admin@example.com'
      );
      DELETE FROM users WHERE email LIKE '%@test.com' OR email = 'admin@example.com';
    `);
    console.log('✅ Dados limpos\n');

    // 2. Criar usuários
    console.log('👤 Criando usuários...');
    
    const now = new Date().toISOString();
    
    await client.query(`
      INSERT INTO users (id, ra, nome, email, senha, tipo, cargo, departamento, "createdAt", "updatedAt")
      VALUES 
        ('admin-001', 'ADM001', 'Admin Teste', 'admin@example.com', $1, 'admin', 'Administrador', 'TI', $2, $2),
        ('gestor-001', 'GES001', 'Maria Gestora', 'gestor@test.com', $1, 'gestor', 'Gerente', 'Vendas', $2, $2),
        ('colab-q1', 'COL001', 'João Q1', 'joao.q1@test.com', $1, 'colaborador', 'Analista Jr', 'Vendas', $2, $2),
        ('colab-q5', 'COL005', 'Pedro Q5', 'pedro.q5@test.com', $1, 'colaborador', 'Analista Pl', 'Vendas', $2, $2),
        ('colab-q9', 'COL009', 'Ana Q9', 'ana.q9@test.com', $1, 'colaborador', 'Analista Sr', 'Vendas', $2, $2)
      ON CONFLICT (email) DO UPDATE SET senha = EXCLUDED.senha, "updatedAt" = EXCLUDED."updatedAt";
    `, [senhaHash, now]);
    
    console.log('✅ Usuários criados\n');

    // 3. Criar relações gestor-colaborador
    console.log('🔗 Criando relações...');
    
    await client.query(`
      INSERT INTO gestor_colaborador (id, "gestorId", "colaboradorId")
      VALUES 
        (gen_random_uuid(), 'gestor-001', 'colab-q1'),
        (gen_random_uuid(), 'gestor-001', 'colab-q5'),
        (gen_random_uuid(), 'gestor-001', 'colab-q9')
      ON CONFLICT ("gestorId", "colaboradorId") DO NOTHING;
    `);
    
    console.log('✅ Relações criadas\n');

    // 4. Criar/atualizar competências
    console.log('📚 Criando competências...');
    
    // Deletar competências de teste antigas
    await client.query(`
      DELETE FROM competencies 
      WHERE nome IN ('Liderança Teste', 'Comunicação Teste', 'Trabalho em Equipe Teste')
         OR id IN ('comp-lid', 'comp-com', 'comp-trab');
    `);
    
    await client.query(`
      INSERT INTO competencies (id, nome, descricao, tipo, "competenciaDe", criterios, "createdAt", "updatedAt")
      VALUES 
        ('comp-lid', 'Liderança Teste', 'Capacidade de liderar', 'comportamental', 'gestor', 
         ARRAY['Inspira equipe', 'Toma decisões', 'Delega tarefas'], $1, $1),
        ('comp-com', 'Comunicação Teste', 'Habilidade de comunicação', 'comportamental', 'todos',
         ARRAY['Comunica claramente', 'Escuta ativamente', 'Apresenta ideias'], $1, $1),
        ('comp-trab', 'Trabalho em Equipe Teste', 'Colaboração', 'comportamental', 'colaborador',
         ARRAY['Colabora', 'Compartilha conhecimento', 'Respeita opiniões'], $1, $1);
    `, [now]);
    
    console.log('✅ Competências criadas\n');

    // 5. Criar campanhas
    console.log('📋 Criando campanhas...');
    
    const dataInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dataFim = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const nowCamp = new Date().toISOString();
    
    await client.query(`
      INSERT INTO evaluation_campaigns (id, nome, descricao, "dataInicio", "dataFim", status, "tipoAlvo", "tipoAvaliacao", "createdAt", "updatedAt")
      VALUES 
        ('camp-desemp-test', 'Avaliação Desempenho Teste', 'Teste', $1, $2, 'ativa', 'colaborador', 'desempenho', $3, $3),
        ('camp-potenc-test', 'Avaliação Potencial Teste', 'Teste', $1, $2, 'ativa', 'colaborador', 'potencial', $3, $3)
      ON CONFLICT (id) DO UPDATE SET status = 'ativa', "dataFim" = EXCLUDED."dataFim", "updatedAt" = EXCLUDED."updatedAt";
    `, [dataInicio, dataFim, nowCamp]);
    
    console.log('✅ Campanhas criadas\n');

    // 6. Associar competências às campanhas
    console.log('🔗 Associando competências...');
    
    await client.query(`
      INSERT INTO campaign_competencies (id, "campaignId", "competencyId")
      VALUES 
        (gen_random_uuid(), 'camp-desemp-test', 'comp-lid'),
        (gen_random_uuid(), 'camp-desemp-test', 'comp-com'),
        (gen_random_uuid(), 'camp-desemp-test', 'comp-trab'),
        (gen_random_uuid(), 'camp-potenc-test', 'comp-lid'),
        (gen_random_uuid(), 'camp-potenc-test', 'comp-com'),
        (gen_random_uuid(), 'camp-potenc-test', 'comp-trab')
      ON CONFLICT ("campaignId", "competencyId") DO NOTHING;
    `);
    
    console.log('✅ Competências associadas\n');

    // 7. Criar avaliações
    console.log('📝 Criando avaliações...');
    
    const nowEval = new Date().toISOString();
    
    await client.query(`
      INSERT INTO evaluations (id, "campaignId", "avaliadorId", "avaliadoId", criterios, media, comentario, data, "createdAt", "updatedAt")
      VALUES 
        -- DESEMPENHO
        (gen_random_uuid(), 'camp-desemp-test', 'gestor-001', 'colab-q1', 
         '{"Liderança Teste": 1.5, "Comunicação Teste": 1.5, "Trabalho em Equipe Teste": 1.5}'::jsonb, 1.5, 'Baixo', $1, $1, $1),
        (gen_random_uuid(), 'camp-desemp-test', 'gestor-001', 'colab-q5',
         '{"Liderança Teste": 2.5, "Comunicação Teste": 2.5, "Trabalho em Equipe Teste": 2.5}'::jsonb, 2.5, 'Médio', $1, $1, $1),
        (gen_random_uuid(), 'camp-desemp-test', 'gestor-001', 'colab-q9',
         '{"Liderança Teste": 3.8, "Comunicação Teste": 3.8, "Trabalho em Equipe Teste": 3.8}'::jsonb, 3.8, 'Alto', $1, $1, $1),
        -- POTENCIAL
        (gen_random_uuid(), 'camp-potenc-test', 'gestor-001', 'colab-q1',
         '{"Liderança Teste": 1.5, "Comunicação Teste": 1.5, "Trabalho em Equipe Teste": 1.5}'::jsonb, 1.5, 'Baixo', $1, $1, $1),
        (gen_random_uuid(), 'camp-potenc-test', 'gestor-001', 'colab-q5',
         '{"Liderança Teste": 2.5, "Comunicação Teste": 2.5, "Trabalho em Equipe Teste": 2.5}'::jsonb, 2.5, 'Médio', $1, $1, $1),
        (gen_random_uuid(), 'camp-potenc-test', 'gestor-001', 'colab-q9',
         '{"Liderança Teste": 3.8, "Comunicação Teste": 3.8, "Trabalho em Equipe Teste": 3.8}'::jsonb, 3.8, 'Alto', $1, $1, $1)
      ON CONFLICT ("campaignId", "avaliadorId", "avaliadoId") DO NOTHING;
    `, [nowEval]);
    
    console.log('✅ Avaliações criadas\n');

    // Verificar
    const result = await client.query(`
      SELECT 
        u.nome,
        AVG(CASE WHEN c."tipoAvaliacao" = 'desempenho' THEN e.media END) as performance,
        AVG(CASE WHEN c."tipoAvaliacao" = 'potencial' THEN e.media END) as potential
      FROM users u
      LEFT JOIN evaluations e ON u.id = e."avaliadoId"
      LEFT JOIN evaluation_campaigns c ON e."campaignId" = c.id
      WHERE u.email LIKE '%@test.com'
      GROUP BY u.nome
      ORDER BY u.nome;
    `);

    console.log('='.repeat(50));
    console.log('🎉 Seed concluído!\n');
    console.log('📋 Login:');
    console.log('   admin@example.com / admin123\n');
    console.log('📊 Nine-Box criado:');
    result.rows.forEach(row => {
      const gridX = row.performance < 2.01 ? 1 : row.performance < 3.01 ? 2 : 3;
      const gridY = row.potential < 2.01 ? 1 : row.potential < 3.01 ? 2 : 3;
      console.log(`   ${row.nome}: P=${row.performance} Pot=${row.potential} → Grid(${gridX},${gridY})`);
    });
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
