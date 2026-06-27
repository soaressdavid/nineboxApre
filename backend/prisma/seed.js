import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────────
const rnd = () => parseFloat((Math.random() * 3 + 1).toFixed(1));

const comment = (score) => {
  if (score >= 3.5) return ['Excelente desempenho', 'Profissional exemplar', 'Supera expectativas', 'Referência no departamento'][Math.floor(Math.random() * 4)];
  if (score >= 2.5) return ['Bom desempenho', 'Profissional sólido', 'Cumpre bem as metas', 'Desempenho consistente'][Math.floor(Math.random() * 4)];
  if (score >= 1.5) return ['Desempenho regular', 'Precisa melhorar', 'Abaixo do esperado', 'Em desenvolvimento'][Math.floor(Math.random() * 4)];
  return ['Desempenho insuficiente', 'Precisa de atenção', 'Abaixo do mínimo', 'Requer acompanhamento'][Math.floor(Math.random() * 4)];
};

const classify = (score) => score < 2.01 ? 1 : score < 3.01 ? 2 : 3;

const NB_MATRIZ = {
  '1-1': 'Q1 (Insuficiente)',  '2-1': 'Q2 (Questionável)',  '3-1': 'Q3 (Especialista)',
  '1-2': 'Q4 (Inconsistente)', '2-2': 'Q5 (Profissional)',  '3-2': 'Q6 (Destaque)',
  '1-3': 'Q7 (Enigma)',        '2-3': 'Q8 (Alto Potencial)', '3-3': 'Q9 (Estrela)',
};

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ── Limpar banco ─────────────────────────────────────────────────────────────
  console.log('🗑️  Limpando banco...');
  await prisma.evaluation.deleteMany();
  await prisma.campaignGestorColaborador.deleteMany();
  await prisma.campaignGestor.deleteMany();
  await prisma.campaignCompetency.deleteMany();
  await prisma.evaluationCampaign.deleteMany();
  await prisma.gestorColaborador.deleteMany();
  await prisma.nineBox.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // ── Usuários ─────────────────────────────────────────────────────────────────
  console.log('👥 Criando usuários...');
  const hash = (p) => bcrypt.hash(p, 10);

  await prisma.user.createMany({
    data: [
      { ra: '1234567', nome: 'Admin Sistema',    email: 'admin@eniac.edu.br',            senha: await hash('admin123'), tipo: 'admin',        cargo: 'Administrador do Sistema',       departamento: 'Tecnologia da Informação' },
      { ra: '1234568', nome: 'Patricia Almeida', email: 'patricia.almeida@eniac.edu.br', senha: await hash('admin123'), tipo: 'admin',        cargo: 'Diretora de RH',                 departamento: 'Recursos Humanos' },
      { ra: '2021001', nome: 'João Silva',       email: 'joao.silva@eniac.edu.br',       senha: await hash('senha123'), tipo: 'gestor',       cargo: 'Gerente de TI',                  departamento: 'Tecnologia da Informação' },
      { ra: '2021002', nome: 'Maria Santos',     email: 'maria.santos@eniac.edu.br',     senha: await hash('senha123'), tipo: 'gestor',       cargo: 'Gerente de RH',                  departamento: 'Recursos Humanos' },
      { ra: '2021003', nome: 'Roberto Ferreira', email: 'roberto.ferreira@eniac.edu.br', senha: await hash('senha123'), tipo: 'gestor',       cargo: 'Coordenador de Desenvolvimento', departamento: 'Tecnologia da Informação' },
      { ra: '2021004', nome: 'Fernanda Lima',    email: 'fernanda.lima@eniac.edu.br',    senha: await hash('senha123'), tipo: 'gestor',       cargo: 'Gerente Comercial',              departamento: 'Vendas' },
      { ra: '2021005', nome: 'Carlos Mendes',    email: 'carlos.mendes@eniac.edu.br',    senha: await hash('senha123'), tipo: 'gestor',       cargo: 'Gerente Financeiro',             departamento: 'Financeiro' },
      { ra: '2021006', nome: 'Juliana Costa',    email: 'juliana.costa@eniac.edu.br',    senha: await hash('senha123'), tipo: 'gestor',       cargo: 'Coordenadora de Marketing',      departamento: 'Marketing' },
      { ra: '2021007', nome: 'Ricardo Oliveira', email: 'ricardo.oliveira@eniac.edu.br', senha: await hash('senha123'), tipo: 'gestor',       cargo: 'Gerente de Operações',           departamento: 'Operações' },
      { ra: '2021008', nome: 'Amanda Pereira',   email: 'amanda.pereira@eniac.edu.br',   senha: await hash('senha123'), tipo: 'gestor',       cargo: 'Gerente de Qualidade',           departamento: 'Qualidade' },
      { ra: '2021009', nome: 'Felipe Martins',   email: 'felipe.martins@eniac.edu.br',   senha: await hash('senha123'), tipo: 'gestor',       cargo: 'Coordenador de Projetos',        departamento: 'Tecnologia da Informação' },
      { ra: '2021010', nome: 'Carla Rocha',      email: 'carla.rocha@eniac.edu.br',      senha: await hash('senha123'), tipo: 'gestor',       cargo: 'Gerente de Logística',           departamento: 'Logística' },
    ]
  });

  await prisma.user.createMany({
    data: [
      { ra: '2022001', nome: 'Ana Costa',          email: 'ana.costa@eniac.edu.br',          senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Desenvolvedora Full Stack',          departamento: 'Tecnologia da Informação' },
      { ra: '2022002', nome: 'Carlos Oliveira',    email: 'carlos.oliveira@eniac.edu.br',    senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Sistemas',               departamento: 'Tecnologia da Informação' },
      { ra: '2022003', nome: 'Bruno Martins',      email: 'bruno.martins@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Desenvolvedor Backend',              departamento: 'Tecnologia da Informação' },
      { ra: '2022004', nome: 'Camila Rodrigues',   email: 'camila.rodrigues@eniac.edu.br',   senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Desenvolvedora Frontend',            departamento: 'Tecnologia da Informação' },
      { ra: '2022005', nome: 'Diego Souza',        email: 'diego.souza@eniac.edu.br',        senha: await hash('senha123'), tipo: 'colaborador', cargo: 'DevOps Engineer',                    departamento: 'Tecnologia da Informação' },
      { ra: '2022006', nome: 'Eduarda Pereira',    email: 'eduarda.pereira@eniac.edu.br',    senha: await hash('senha123'), tipo: 'colaborador', cargo: 'QA Analyst',                         departamento: 'Tecnologia da Informação' },
      { ra: '2022007', nome: 'Felipe Araújo',      email: 'felipe.araujo@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de RH',                     departamento: 'Recursos Humanos' },
      { ra: '2022008', nome: 'Gabriela Nunes',     email: 'gabriela.nunes@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Assistente de Recrutamento',         departamento: 'Recursos Humanos' },
      { ra: '2022009', nome: 'Henrique Barros',    email: 'henrique.barros@eniac.edu.br',    senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Desenvolvimento Humano', departamento: 'Recursos Humanos' },
      { ra: '2022010', nome: 'Isabela Cardoso',    email: 'isabela.cardoso@eniac.edu.br',    senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Executiva de Vendas',                departamento: 'Vendas' },
      { ra: '2022011', nome: 'João Pedro Alves',   email: 'joao.alves@eniac.edu.br',         senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Consultor Comercial',                departamento: 'Vendas' },
      { ra: '2022012', nome: 'Larissa Moreira',    email: 'larissa.moreira@eniac.edu.br',    senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Vendas',                 departamento: 'Vendas' },
      { ra: '2022013', nome: 'Marcos Vieira',      email: 'marcos.vieira@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Representante Comercial',            departamento: 'Vendas' },
      { ra: '2022014', nome: 'Natália Ribeiro',    email: 'natalia.ribeiro@eniac.edu.br',    senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista Financeiro',                departamento: 'Financeiro' },
      { ra: '2022015', nome: 'Otávio Gomes',       email: 'otavio.gomes@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Assistente Contábil',                departamento: 'Financeiro' },
      { ra: '2022016', nome: 'Paula Freitas',      email: 'paula.freitas@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Contas a Pagar',         departamento: 'Financeiro' },
      { ra: '2022017', nome: 'Rafael Teixeira',    email: 'rafael.teixeira@eniac.edu.br',    senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Designer Gráfico',                   departamento: 'Marketing' },
      { ra: '2022018', nome: 'Sabrina Dias',       email: 'sabrina.dias@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Marketing Digital',      departamento: 'Marketing' },
      { ra: '2022019', nome: 'Thiago Cunha',       email: 'thiago.cunha@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Social Media',                       departamento: 'Marketing' },
      { ra: '2022020', nome: 'Vanessa Lopes',      email: 'vanessa.lopes@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Redatora de Conteúdo',               departamento: 'Marketing' },
      { ra: '2022021', nome: 'William Castro',     email: 'william.castro@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Suporte',                departamento: 'Tecnologia da Informação' },
      { ra: '2022022', nome: 'Yasmin Silva',       email: 'yasmin.silva@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Técnica de Suporte',                 departamento: 'Tecnologia da Informação' },
      { ra: '2022023', nome: 'André Barbosa',      email: 'andre.barbosa@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Estagiário de TI',                   departamento: 'Tecnologia da Informação' },
      { ra: '2022024', nome: 'Beatriz Campos',     email: 'beatriz.campos@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Estagiária de Marketing',             departamento: 'Marketing' },
      { ra: '2022025', nome: 'Caio Monteiro',      email: 'caio.monteiro@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Estagiário de Vendas',               departamento: 'Vendas' },
      { ra: '2022026', nome: 'Daniele Cruz',       email: 'danielle.cruz@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Negócios',               departamento: 'Tecnologia da Informação' },
      { ra: '2022027', nome: 'Eduardo Ramos',      email: 'eduardo.ramos@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Engenheiro de Software',             departamento: 'Tecnologia da Informação' },
      { ra: '2022028', nome: 'Fátima Lima',        email: 'fatima.lima@eniac.edu.br',        senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Coordenadora de TI',                 departamento: 'Tecnologia da Informação' },
      { ra: '2022029', nome: 'Gustavo Santos',     email: 'gustavo.santos@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Arquiteto de Soluções',              departamento: 'Tecnologia da Informação' },
      { ra: '2022030', nome: 'Helena Fernandes',   email: 'helena.fernandes@eniac.edu.br',   senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Product Owner',                      departamento: 'Tecnologia da Informação' },
      { ra: '2022031', nome: 'Igor Mendes',        email: 'igor.mendes@eniac.edu.br',        senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Scrum Master',                       departamento: 'Tecnologia da Informação' },
      { ra: '2022032', nome: 'Júlia Carvalho',     email: 'julia.carvalho@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'UX Designer',                        departamento: 'Tecnologia da Informação' },
      { ra: '2022033', nome: 'Kleber Rocha',       email: 'kleber.rocha@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Security Analyst',                   departamento: 'Tecnologia da Informação' },
      { ra: '2022034', nome: 'Lívia Almeida',      email: 'livia.almeida@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Data Scientist',                     departamento: 'Tecnologia da Informação' },
      { ra: '2022035', nome: 'Murilo Costa',       email: 'murilo.costa@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Database Administrator',             departamento: 'Tecnologia da Informação' },
      { ra: '2022036', nome: 'Nádia Pires',        email: 'nadia.pires@eniac.edu.br',        senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Business Intelligence',              departamento: 'Tecnologia da Informação' },
      { ra: '2022037', nome: 'Orlando Torres',     email: 'orlando.torres@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Cloud Architect',                    departamento: 'Tecnologia da Informação' },
      { ra: '2022038', nome: 'Priscila Gomes',     email: 'priscila.gomes@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Mobile Developer',                   departamento: 'Tecnologia da Informação' },
      { ra: '2022039', nome: 'Quintino Barbosa',   email: 'quintino.barbosa@eniac.edu.br',   senha: await hash('senha123'), tipo: 'colaborador', cargo: 'DevSecOps Engineer',                 departamento: 'Tecnologia da Informação' },
      { ra: '2022040', nome: 'Renata Farias',      email: 'renata.farias@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Tech Lead',                          departamento: 'Tecnologia da Informação' },
      { ra: '2022041', nome: 'Sônia Brandão',      email: 'sonia.brandao@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Gerente de Treinamento',             departamento: 'Recursos Humanos' },
      { ra: '2022042', nome: 'Tadeu Viana',        email: 'tadeu.viana@eniac.edu.br',        senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Benefícios',             departamento: 'Recursos Humanos' },
      { ra: '2022043', nome: 'Ursula Correia',     email: 'ursula.correia@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Coordenadora de RH',                 departamento: 'Recursos Humanos' },
      { ra: '2022044', nome: 'Valter Peixoto',     email: 'valter.peixoto@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Especialista em RH',                 departamento: 'Recursos Humanos' },
      { ra: '2022045', nome: 'Wanda Batista',      email: 'wanda.batista@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Cargos e Salários',      departamento: 'Recursos Humanos' },
      { ra: '2022046', nome: 'Xavier Duarte',      email: 'xavier.duarte@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Gerente Regional de Vendas',         departamento: 'Vendas' },
      { ra: '2022047', nome: 'Yara Fonseca',       email: 'yara.fonseca@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Key Account Manager',                departamento: 'Vendas' },
      { ra: '2022048', nome: 'Zélia Macedo',       email: 'zelia.macedo@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Inside Sales',                       departamento: 'Vendas' },
      { ra: '2022049', nome: 'Arthur Neves',       email: 'arthur.neves@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Sales Representative',               departamento: 'Vendas' },
      { ra: '2022050', nome: 'Bianca Tavares',     email: 'bianca.tavares@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Sales Coordinator',                  departamento: 'Vendas' },
      { ra: '2022051', nome: 'César Lima',         email: 'cesar.lima@eniac.edu.br',         senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Controller',                         departamento: 'Financeiro' },
      { ra: '2022052', nome: 'Débora Soares',      email: 'debora.soares@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Investimentos',          departamento: 'Financeiro' },
      { ra: '2022053', nome: 'Éder Ramos',         email: 'eder.ramos@eniac.edu.br',         senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Tesoureiro',                         departamento: 'Financeiro' },
      { ra: '2022054', nome: 'Fabiana Costa',      email: 'fabiana.costa@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Crédito',                departamento: 'Financeiro' },
      { ra: '2022055', nome: 'Gilberto Pinto',     email: 'gilberto.pinto@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Auditor Interno',                    departamento: 'Financeiro' },
      { ra: '2022056', nome: 'Helena Moura',       email: 'helena.moura@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Gerente de Marca',                   departamento: 'Marketing' },
      { ra: '2022057', nome: 'Ivan Guimarães',     email: 'ivan.guimaraes@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Growth Hacker',                      departamento: 'Marketing' },
      { ra: '2022058', nome: 'Jéssica Viana',      email: 'jessica.viana@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Content Manager',                    departamento: 'Marketing' },
      { ra: '2022059', nome: 'Kátia Rios',         email: 'katia.rios@eniac.edu.br',         senha: await hash('senha123'), tipo: 'colaborador', cargo: 'SEO Specialist',                     departamento: 'Marketing' },
      { ra: '2022060', nome: 'Leandro Melo',       email: 'leandro.melo@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Performance Marketing',              departamento: 'Marketing' },
      { ra: '2022061', nome: 'Mariana Sá',         email: 'mariana.sa@eniac.edu.br',         senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Gerente de Operações',               departamento: 'Operações' },
      { ra: '2022062', nome: 'Nilton Figueiredo',  email: 'nilton.figueiredo@eniac.edu.br',  senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Supervisor de Produção',             departamento: 'Operações' },
      { ra: '2022063', nome: 'Olga Nascimento',    email: 'olga.nascimento@eniac.edu.br',    senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Processos',              departamento: 'Operações' },
      { ra: '2022064', nome: 'Paulo Sérgio',       email: 'paulo.sergio@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Coordenador de Logística',           departamento: 'Operações' },
      { ra: '2022065', nome: 'Quezia Bezerra',     email: 'quezia.bezerra@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Planejamento de Produção',           departamento: 'Operações' },
      { ra: '2022066', nome: 'Ronaldo Araújo',     email: 'ronaldo.araujo@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Gerente de Qualidade',               departamento: 'Qualidade' },
      { ra: '2022067', nome: 'Sandra Lopes',       email: 'sandra.lopes@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'QA Engineer',                        departamento: 'Qualidade' },
      { ra: '2022068', nome: 'Tatiana Borges',     email: 'tatiana.borges@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Qualidade',              departamento: 'Qualidade' },
      { ra: '2022069', nome: 'Ulysses Cunha',      email: 'ulysses.cunha@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Auditor de Qualidade',               departamento: 'Qualidade' },
      { ra: '2022070', nome: 'Vera Lúcia',         email: 'vera.lucia@eniac.edu.br',         senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Especialista em ISO',                departamento: 'Qualidade' },
      { ra: '2022071', nome: 'Wagner Moreira',     email: 'wagner.moreira@eniac.edu.br',     senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Gerente de Logística',               departamento: 'Logística' },
      { ra: '2022072', nome: 'Ximenes Pires',      email: 'ximenes.pires@eniac.edu.br',      senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Coordenador de Transporte',          departamento: 'Logística' },
      { ra: '2022073', nome: 'Yuri Alencar',       email: 'yuri.alencar@eniac.edu.br',       senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Analista de Estoques',               departamento: 'Logística' },
      { ra: '2022074', nome: 'Zuleika Antunes',    email: 'zuleika.antunes@eniac.edu.br',    senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Supervisora de Armazém',             departamento: 'Logística' },
      { ra: '2022075', nome: 'Adriano Freitas',    email: 'adriano.freitas@eniac.edu.br',    senha: await hash('senha123'), tipo: 'colaborador', cargo: 'Expedicionista',                     departamento: 'Logística' },
    ]
  });

  // Carregar todos de uma vez para ter os IDs
  const allUsers   = await prisma.user.findMany();
  const gestores   = allUsers.filter(u => u.tipo === 'gestor');
  const colabs     = allUsers.filter(u => u.tipo === 'colaborador');
  const byRA       = Object.fromEntries(allUsers.map(u => [u.ra, u]));

  console.log('✅ Usuários criados');

  // ── Grupos ───────────────────────────────────────────────────────────────────
  console.log('👥 Criando grupos...');

  const deptGestorRA = {
    'Tecnologia da Informação': '2021001',
    'Recursos Humanos':         '2021002',
    'Vendas':                   '2021004',
    'Financeiro':               '2021005',
    'Marketing':                '2021006',
    'Operações':                '2021007',
    'Qualidade':                '2021008',
    'Logística':                '2021010',
  };

  await prisma.gestorColaborador.createMany({
    data: colabs.map(c => ({
      gestorId:      byRA[deptGestorRA[c.departamento] || '2021001'].id,
      colaboradorId: c.id,
    })),
    skipDuplicates: true,
  });

  console.log('✅ Grupos criados');

  // ── Competências ─────────────────────────────────────────────────────────────
  console.log('📚 Criando competências...');

  await prisma.competency.createMany({
    data: [
      { nome: 'Liderança',              descricao: 'Capacidade de liderar e motivar equipes',                    tipo: 'lideranca',   competenciaDe: 'gestor',       criterios: ['Delegar tarefas','Motivar equipe','Tomar decisões','Dar feedback'],          a_melhorar: 'Precisa desenvolver habilidades de delegação', bom: 'Delega bem e motiva equipe',           ideal: 'Líder inspirador, desenvolve talentos',            mediano: 'Delega quando necessário' },
      { nome: 'Comunicação',            descricao: 'Clareza e efetividade na comunicação',                       tipo: 'comportamento',competenciaDe: 'todos',        criterios: ['Clareza oral','Clareza escrita','Escuta ativa'],                           a_melhorar: 'Comunicação confusa ou incompleta',           bom: 'Comunicação clara e efetiva',          ideal: 'Comunicação excepcional, influenciador',           mediano: 'Comunicação básica funcional' },
      { nome: 'Trabalho em Equipe',     descricao: 'Colaboração e sinergia com colegas',                         tipo: 'comportamento',competenciaDe: 'colaborador',  criterios: ['Colaboração','Respeito','Comprometimento'],                                a_melhorar: 'Dificuldade em colaborar',                   bom: 'Colabora bem com a equipe',            ideal: 'Líder de equipe, promove colaboração',             mediano: 'Colabora quando solicitado' },
      { nome: 'Resolução de Problemas', descricao: 'Capacidade analítica e criatividade para resolver problemas',tipo: 'tecnica',     competenciaDe: 'todos',        criterios: ['Análise crítica','Criatividade','Agilidade'],                              a_melhorar: 'Dificuldade em resolver problemas complexos', bom: 'Resolve problemas de forma eficiente', ideal: 'Inovador, resolve problemas complexos',            mediano: 'Resolve problemas básicos' },
      { nome: 'Proatividade',           descricao: 'Iniciativa e antecipação de demandas',                       tipo: 'comportamento',competenciaDe: 'todos',        criterios: ['Iniciativa','Antecipação','Autonomia'],                                    a_melhorar: 'Reativo, espera instruções',                 bom: 'Proativo, antecipa demandas',          ideal: 'Altamente proativo, influencia positivamente',     mediano: 'Age quando instruído' },
      { nome: 'Gestão de Tempo',        descricao: 'Organização e priorização de tarefas',                       tipo: 'comportamento',competenciaDe: 'todos',        criterios: ['Organização','Priorização','Cumprimento de prazos'],                       a_melhorar: 'Desorganizado, perde prazos',                bom: 'Organizado, cumpre prazos',            ideal: 'Excelente gestão de tempo, otimiza processos',     mediano: 'Organização básica' },
      { nome: 'Conhecimento Técnico',   descricao: 'Domínio das competências técnicas da área',                  tipo: 'tecnica',     competenciaDe: 'todos',        criterios: ['Domínio técnico','Aprendizado contínuo','Aplicação prática'],              a_melhorar: 'Conhecimento técnico limitado',              bom: 'Bom domínio técnico',                  ideal: 'Referência técnica, inova',                        mediano: 'Conhecimento básico' },
    ]
  });

  const comps       = await prisma.competency.findMany();
  const compByNome  = Object.fromEntries(comps.map(c => [c.nome, c]));
  const C = {
    lideranca:    compByNome['Liderança'].id,
    comunicacao:  compByNome['Comunicação'].id,
    equipe:       compByNome['Trabalho em Equipe'].id,
    resolucao:    compByNome['Resolução de Problemas'].id,
    proatividade: compByNome['Proatividade'].id,
    gestaoTempo:  compByNome['Gestão de Tempo'].id,
    tecnico:      compByNome['Conhecimento Técnico'].id,
  };

  console.log('✅ Competências criadas');

  // ── Campanhas ────────────────────────────────────────────────────────────────
  console.log('📋 Criando campanhas...');

  // Critérios pré-computados por tipo de campanha (evita queries por colaborador depois)
  const criteriosDesempenho = ['Clareza oral','Clareza escrita','Escuta ativa','Colaboração','Respeito','Comprometimento','Iniciativa','Antecipação','Autonomia','Organização','Priorização','Cumprimento de prazos'];
  const criteriosPotencial  = ['Delegar tarefas','Motivar equipe','Tomar decisões','Dar feedback','Iniciativa','Antecipação','Autonomia','Análise crítica','Criatividade','Agilidade','Domínio técnico','Aprendizado contínuo','Aplicação prática'];

  const deptEntries = Object.entries(deptGestorRA);
  const campanhasInfo = []; // { campaignId, gestorId, colabIds[], criterios[], tipo }

  for (const [dept, gestorRA] of deptEntries) {
    const gestor     = byRA[gestorRA];
    const deptColabs = colabs.filter(c => c.departamento === dept);
    if (!gestor || deptColabs.length === 0) continue;

    // — Desempenho —
    const campDesemp = await prisma.evaluationCampaign.create({
      data: {
        nome:         `Avaliação de Desempenho ${dept} - 2026/1`,
        descricao:    `Avaliação de desempenho — ${dept}`,
        dataInicio:   new Date('2026-05-01'),
        dataFim:      new Date('2026-06-30'),
        status:       'ativa',
        tipoAlvo:     'colaborador',
        tipoAvaliacao:'desempenho',
      }
    });
    const cgDesemp = await prisma.campaignGestor.create({ data: { campaignId: campDesemp.id, gestorId: gestor.id } });
    await prisma.campaignGestorColaborador.createMany({ data: deptColabs.map(c => ({ campaignGestorId: cgDesemp.id, colaboradorId: c.id })), skipDuplicates: true });
    await prisma.campaignCompetency.createMany({ data: [C.comunicacao, C.equipe, C.proatividade, C.gestaoTempo].map(id => ({ campaignId: campDesemp.id, competencyId: id })) });
    campanhasInfo.push({ campaignId: campDesemp.id, gestorId: gestor.id, colabIds: deptColabs.map(c => c.id), criterios: criteriosDesempenho, tipo: 'desempenho' });

    // — Potencial —
    const campPot = await prisma.evaluationCampaign.create({
      data: {
        nome:         `Avaliação de Potencial ${dept} - 2026/1`,
        descricao:    `Avaliação de potencial — ${dept}`,
        dataInicio:   new Date('2026-05-01'),
        dataFim:      new Date('2026-06-30'),
        status:       'ativa',
        tipoAlvo:     'colaborador',
        tipoAvaliacao:'potencial',
      }
    });
    const cgPot = await prisma.campaignGestor.create({ data: { campaignId: campPot.id, gestorId: gestor.id } });
    await prisma.campaignGestorColaborador.createMany({ data: deptColabs.map(c => ({ campaignGestorId: cgPot.id, colaboradorId: c.id })), skipDuplicates: true });
    await prisma.campaignCompetency.createMany({ data: [C.lideranca, C.proatividade, C.resolucao, C.tecnico].map(id => ({ campaignId: campPot.id, competencyId: id })) });
    campanhasInfo.push({ campaignId: campPot.id, gestorId: gestor.id, colabIds: deptColabs.map(c => c.id), criterios: criteriosPotencial, tipo: 'potencial' });
  }

  // — Campanhas de Gestores (desempenho + potencial) —
  // Cada gestor é avaliado pelos seus próprios colaboradores (avaliação 360 de cima pra baixo)
  // Avaliador: admin (Patricia Almeida), avaliado: gestor
  const adminAvaliador = byRA['1234568']; // Patricia Almeida - Diretora de RH

  const criteriosGestorDesemp = ['Liderança','Comunicação','Gestão de Equipe','Tomada de Decisão','Resultados','Planejamento'];
  const criteriosGestorPotenc = ['Visão Estratégica','Desenvolvimento de Talentos','Inovação','Adaptabilidade','Influência'];

  // Declarar aqui para ser usada tanto no bloco de gestores quanto no bloco principal de avaliações
  const todasAvaliacoes = [];

  for (const gestor of gestores) {
    // — Desempenho do gestor —
    const campGDesemp = await prisma.evaluationCampaign.create({
      data: {
        nome:          `Avaliação de Desempenho Gestor - ${gestor.nome} - 2026/1`,
        descricao:     `Avaliação de desempenho do gestor ${gestor.nome} — ${gestor.departamento}`,
        dataInicio:    new Date('2026-05-01'),
        dataFim:       new Date('2026-06-30'),
        status:        'ativa',
        tipoAlvo:      'gestor',
        tipoAvaliacao: 'desempenho',
      }
    });
    const cgGDesemp = await prisma.campaignGestor.create({ data: { campaignId: campGDesemp.id, gestorId: gestor.id } });
    await prisma.campaignCompetency.createMany({
      data: [C.lideranca, C.comunicacao, C.proatividade, C.gestaoTempo].map(id => ({ campaignId: campGDesemp.id, competencyId: id }))
    });
    const critDeObj = {};
    for (const crit of criteriosGestorDesemp) critDeObj[crit] = rnd();
    const scoresGD = Object.values(critDeObj);
    const mediaGD  = parseFloat((scoresGD.reduce((a, b) => a + b, 0) / scoresGD.length).toFixed(2));
    todasAvaliacoes.push({ campaignId: campGDesemp.id, avaliadorId: adminAvaliador.id, avaliadoId: gestor.id, criterios: critDeObj, media: mediaGD, comentario: comment(mediaGD), anonima: false });
    campanhasInfo.push({ campaignId: campGDesemp.id, gestorId: gestor.id, colabIds: [gestor.id], criterios: criteriosGestorDesemp, tipo: 'desempenho_gestor' });

    // — Potencial do gestor —
    const campGPot = await prisma.evaluationCampaign.create({
      data: {
        nome:          `Avaliação de Potencial Gestor - ${gestor.nome} - 2026/1`,
        descricao:     `Avaliação de potencial do gestor ${gestor.nome} — ${gestor.departamento}`,
        dataInicio:    new Date('2026-05-01'),
        dataFim:       new Date('2026-06-30'),
        status:        'ativa',
        tipoAlvo:      'gestor',
        tipoAvaliacao: 'potencial',
      }
    });
    const cgGPot = await prisma.campaignGestor.create({ data: { campaignId: campGPot.id, gestorId: gestor.id } });
    await prisma.campaignCompetency.createMany({
      data: [C.lideranca, C.resolucao, C.proatividade, C.tecnico].map(id => ({ campaignId: campGPot.id, competencyId: id }))
    });
    const critPoObj = {};
    for (const crit of criteriosGestorPotenc) critPoObj[crit] = rnd();
    const scoresGP = Object.values(critPoObj);
    const mediaGP  = parseFloat((scoresGP.reduce((a, b) => a + b, 0) / scoresGP.length).toFixed(2));
    todasAvaliacoes.push({ campaignId: campGPot.id, avaliadorId: adminAvaliador.id, avaliadoId: gestor.id, criterios: critPoObj, media: mediaGP, comentario: comment(mediaGP), anonima: false });
    campanhasInfo.push({ campaignId: campGPot.id, gestorId: gestor.id, colabIds: [gestor.id], criterios: criteriosGestorPotenc, tipo: 'potencial_gestor' });
  }

  // — Campanha histórica —
  const campHist = await prisma.evaluationCampaign.create({
    data: {
      nome: 'Avaliação Anual 2025', descricao: 'Avaliação anual de todos os colaboradores',
      dataInicio: new Date('2025-11-01'), dataFim: new Date('2025-12-31'),
      status: 'finalizada', tipoAlvo: 'colaborador', tipoAvaliacao: 'desempenho',
    }
  });
  // Apenas 1 gestor para a campanha histórica para simplificar
  const cgHist = await prisma.campaignGestor.create({ data: { campaignId: campHist.id, gestorId: byRA['2021001'].id } });
  const histColabs = colabs.slice(0, 20);
  await prisma.campaignGestorColaborador.createMany({ data: histColabs.map(c => ({ campaignGestorId: cgHist.id, colaboradorId: c.id })), skipDuplicates: true });
  await prisma.campaignCompetency.createMany({ data: [C.lideranca, C.comunicacao, C.equipe].map(id => ({ campaignId: campHist.id, competencyId: id })) });

  console.log(`✅ Campanhas criadas (${campanhasInfo.length} ativas + 1 histórica)`);

  // ── Avaliações ───────────────────────────────────────────────────────────────
  // Estratégia: montar todos os registros em memória e inserir em createMany por campanha
  console.log('📝 Criando avaliações...');

  for (const { campaignId, gestorId, colabIds, criterios, tipo } of campanhasInfo) {
    // Avaliações de gestores já foram adicionadas no bloco acima
    if (tipo === 'desempenho_gestor' || tipo === 'potencial_gestor') continue;
    for (const avaliadoId of colabIds) {
      const criteriosObj = {};
      for (const crit of criterios) criteriosObj[crit] = rnd();
      const scores = Object.values(criteriosObj);
      const media  = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
      todasAvaliacoes.push({ campaignId, avaliadorId: gestorId, avaliadoId, criterios: criteriosObj, media, comentario: comment(media), anonima: false });
    }
  }

  // Avaliações históricas (critérios simples)
  for (const colab of histColabs) {
    const criteriosObj = { 'Desempenho geral': rnd(), 'Metas atingidas': rnd(), 'Comportamento': rnd() };
    const scores = Object.values(criteriosObj);
    const media  = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
    todasAvaliacoes.push({ campaignId: campHist.id, avaliadorId: byRA['2021001'].id, avaliadoId: colab.id, criterios: criteriosObj, media, comentario: comment(media), anonima: false });
  }

  // Inserir em lotes de 100 para não sobrecarregar
  const BATCH = 100;
  for (let i = 0; i < todasAvaliacoes.length; i += BATCH) {
    await prisma.evaluation.createMany({ data: todasAvaliacoes.slice(i, i + BATCH), skipDuplicates: true });
  }

  console.log(`✅ Avaliações criadas (${todasAvaliacoes.length} registros)`);

  // ── Nine Box ─────────────────────────────────────────────────────────────────
  // Buscar todas as avaliações de uma vez e calcular em memória
  console.log('📊 Calculando Nine Box...');

  const todasEvals = await prisma.evaluation.findMany({
    where:   { avaliadoId: { in: [...colabs, ...gestores].map(u => u.id) } },
    include: { campaign: { select: { tipoAvaliacao: true } } },
  });

  // Agrupar por avaliado e tipo
  const evalsPorColab = {};
  for (const e of todasEvals) {
    if (!evalsPorColab[e.avaliadoId]) evalsPorColab[e.avaliadoId] = { desempenho: [], potencial: [] };
    if (e.media != null) evalsPorColab[e.avaliadoId][e.campaign.tipoAvaliacao]?.push(e.media);
  }

  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  const nineBoxData = [];
  // Colaboradores + Gestores no nine box
  for (const pessoa of [...colabs, ...gestores]) {
    const evals = evalsPorColab[pessoa.id];
    if (!evals || !evals.desempenho.length || !evals.potencial.length) continue;

    const performance = parseFloat(avg(evals.desempenho).toFixed(2));
    const potential   = parseFloat(avg(evals.potencial).toFixed(2));
    const xClass      = classify(performance);
    const yClass      = classify(potential);
    const categoria   = NB_MATRIZ[`${xClass}-${yClass}`] || 'Indefinido';

    nineBoxData.push({
      pessoaId:   pessoa.id,
      performance,
      potential,
      categoria,
      comentario: `Performance: ${performance.toFixed(2)}, Potencial: ${potential.toFixed(2)}`,
    });
  }

  await prisma.nineBox.createMany({ data: nineBoxData, skipDuplicates: true });

  console.log(`✅ Nine Box criado (${nineBoxData.length} colaboradores)`);

  // ── Resumo ───────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed concluído com sucesso!');
  console.log(`  👤 Admins: 2`);
  console.log(`  👔 Gestores: ${gestores.length}`);
  console.log(`  👷 Colaboradores: ${colabs.length}`);
  console.log(`  📚 Competências: ${comps.length}`);
  console.log(`  📋 Campanhas ativas: ${campanhasInfo.length} (desempenho + potencial por departamento + gestores)`);
  console.log(`  📝 Avaliações: ${todasAvaliacoes.length}`);
  console.log(`  📊 Nine Box: ${nineBoxData.length} pessoas classificadas (colaboradores + gestores)`);
  console.log('\n  🔑 Senha padrão: senha123');
  console.log('  🔑 Senha admin: admin123');
}

main()
  .catch(e => { console.error('❌ Erro no seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
