# Como Testar as Correções - Guia Rápido

## 🎯 Objetivo

Validar que as 7 correções implementadas estão funcionando corretamente no sistema.

---

## 📋 Pré-requisitos

✅ Backend rodando em `http://localhost:3000`  
✅ Dados de teste criados (executar `node backend/scripts/quick-seed.js`)  
✅ Frontend acessível

---

## 🧪 Teste 1: Validação Automatizada (2 minutos)

### Execute o script de testes

```bash
cd backend
node scripts/test-corrections.js
```

### Resultado Esperado

```
✅ Teste 1 (Classificação): PASSOU
✅ Teste 2 (Grid Position): PASSOU  
✅ Teste 3 (Categorias): PASSOU
✅ Teste 4 (Edge Cases): PASSOU

🎉 TODOS OS TESTES PASSARAM!
```

**Se todos os testes passaram:** ✅ As correções do backend estão funcionando!

---

## 🔴 Teste 2: Edição de Avaliação - Issue #2 CRÍTICO (5 minutos)

### Objetivo
Validar que editar avaliações não causa mais crash.

### Passos

1. **Login:**
   - Email: `admin@example.com`
   - Senha: `admin123`

2. **Listar avaliações:**
   ```bash
   curl -X GET http://localhost:3000/api/evaluations?page=1&limit=10 \
     -H "Authorization: Bearer SEU_TOKEN"
   ```

3. **Pegar o ID de uma avaliação existente**

4. **Editar a avaliação (ANTES CRASHAVA!):**
   ```bash
   curl -X PUT http://localhost:3000/api/evaluations/ID_DA_AVALIACAO \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN" \
     -d '{
       "criterios": {
         "Liderança Teste": 4.0,
         "Comunicação Teste": 3.5,
         "Trabalho em Equipe Teste": 3.8
       },
       "comentario": "Avaliação atualizada com sucesso!"
     }'
   ```

### Resultado Esperado

✅ **Status 200**  
✅ **Resposta JSON com avaliação atualizada**  
✅ **Nova média recalculada: 3.77**  
❌ **NÃO deve crashar ou retornar erro 500**

---

## 📊 Teste 3: Nine-Box Grid - Issue #6 CRÍTICO (5 minutos)

### Objetivo
Validar que os quadrantes mostram os nomes corretos.

### Passos

1. **Abrir a página Nine-Box:**
   ```
   http://localhost:PORTA/frontend-ref/pages/nine-box.html
   ```

2. **Fazer login** (se necessário)

3. **Verificar o grid visualmente**

### Resultado Esperado

Você deve ver 3 pessoas no grid:

```
     │        │        │
─────┼────────┼────────┼─────
     │        │        │ Ana Q9
     │        │        │ (3,3)
─────┼────────┼────────┼─────
     │        │ Pedro  │
     │        │  Q5    │
     │        │ (2,2)  │
─────┼────────┼────────┼─────
João │        │        │
 Q1  │        │        │
(1,1)│        │        │
─────┴────────┴────────┴─────
```

4. **Clicar em João Q1** (canto inferior esquerdo)
   - ✅ Modal deve mostrar: **"Q1 (Insuficiente)"**
   - ✅ Descrição: "Potencial baixo e desempenho abaixo do esperado"

5. **Clicar em Pedro Q5** (centro)
   - ✅ Modal deve mostrar: **"Q5 (Mantenedor)"**
   - ✅ Descrição: "Potencial e desempenho em nível mediano"

6. **Clicar em Ana Q9** (canto superior direito)
   - ✅ Modal deve mostrar: **"Q9 (Estrela)"**
   - ✅ Descrição: "Alto potencial e desempenho acima do esperado"

❌ **ANTES da correção:** Os nomes estariam errados em 6 de 9 posições!

---

## 🎯 Teste 4: Thresholds de Conversão - Issue #7 (3 minutos)

### Objetivo
Validar que scores são classificados corretamente.

### Teste com SQL

Execute no banco de dados:

```sql
-- Criar um colaborador de teste
INSERT INTO users (id, ra, nome, email, senha, tipo, "createdAt", "updatedAt")
VALUES ('test-threshold', 'TEST01', 'Teste Threshold', 'threshold@test.com', 
        '$2b$10$rGHqZ7QXJqx5J3yJ0FxJVeTqYxVBKvxJqxJ5J3yJ0FxJVeTqYxVBK', 
        'colaborador', NOW(), NOW());

-- Criar avaliação com score exatamente 2.0 (limite BAIXO)
INSERT INTO evaluations (id, "campaignId", "avaliadorId", "avaliadoId", 
                         criterios, media, data, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'camp-desemp-test', 'gestor-001', 'test-threshold',
        '{}'::jsonb, 2.0, NOW(), NOW(), NOW());

-- Criar avaliação de potencial com 2.0
INSERT INTO evaluations (id, "campaignId", "avaliadorId", "avaliadoId", 
                         criterios, media, data, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'camp-potenc-test', 'gestor-001', 'test-threshold',
        '{}'::jsonb, 2.0, NOW(), NOW(), NOW());
```

### Verificar no Nine-Box

1. Recarregar a página nine-box.html
2. Procurar "Teste Threshold"
3. ✅ Deve estar em **Grid(1,1)** = Q1 (Insuficiente)
4. ✅ Score 2.0 deve ser classificado como **BAIXO** (grid 1)

### Testar outros limites

| Score | Classificação | Grid Esperado |
|-------|---------------|---------------|
| 2.0 | BAIXO | 1 |
| 2.1 | MÉDIO | 2 |
| 3.0 | MÉDIO | 2 |
| 3.1 | ALTO | 3 |

---

## 🔍 Teste 5: Validação de localStorage - Issue #1 (3 minutos)

### Objetivo
Verificar que o sistema avisa sobre critérios incompletos.

### Passos

1. **Abrir:** `http://localhost:PORTA/frontend-ref/pages/responder-avaliacao.html`

2. **Iniciar uma avaliação**

3. **Preencher apenas ALGUNS critérios** (não todos)

4. **Fechar o navegador** (dados salvos no localStorage)

5. **Reabrir a página**

6. **Tentar finalizar**

7. **Abrir o Console do navegador (F12)**

### Resultado Esperado

✅ Console deve mostrar warning:
```
⚠️ Competency "Nome" has incomplete criteria: 2/4 answered. 
   This may indicate sparse array data loss from localStorage restoration.
```

❌ **ANTES:** Critérios faltando eram silenciosamente descartados, inflando a média!

---

## 📖 Teste 6: Documentação - Issues #3 e #4 (2 minutos)

### Objetivo
Verificar que os comentários e documentação estão corretos.

### Issue #3 - Documentação da Média

1. **Abrir:** `backend/src/modules/evaluations/evaluation.service.js`

2. **Procurar linhas 98-103**

3. ✅ Deve ter comentário explicando **"mean of means"**

### Issue #4 - Comentário Corrigido

1. **Abrir:** `backend/src/modules/ninebox/ninebox.service.js`

2. **Procurar linha 30** (método `calculateCategoria`)

3. ✅ Comentário deve dizer: "Usa classifyScore: BAIXO (≤2.0), MÉDIO (≤3.0), ALTO (>3.0)"

4. ❌ NÃO deve dizer: "BAIXO (1-1.5), MÉDIO (1.6-2.5)" (estava errado!)

---

## ✅ Checklist de Validação Completa

### Backend
- [ ] ✅ Script `test-corrections.js` passou 100%
- [ ] ✅ Editar avaliação funciona sem crash
- [ ] ✅ Nine-Box calcula posições corretas
- [ ] ✅ Thresholds estão corretos (≤2.0, ≤3.0, >3.0)
- [ ] ✅ Documentação atualizada

### Frontend
- [ ] ✅ Nine-Box mostra nomes corretos em todos os 9 quadrantes
- [ ] ✅ Modal de detalhes mostra informações corretas
- [ ] ✅ Warning de localStorage funciona
- [ ] ✅ Fallback de conversão usa thresholds corretos

### Geral
- [ ] ✅ Sem erros no console do navegador
- [ ] ✅ Sem erros no console do backend
- [ ] ✅ Dados de teste criados com sucesso

---

## 🐛 Troubleshooting

### Backend não está respondendo

```bash
# Verificar se está rodando
curl http://localhost:3000/health

# Se não estiver, iniciar:
cd backend
npm run dev
```

### Dados de teste não existem

```bash
cd backend
node scripts/quick-seed.js
```

### Erro de autenticação

Use as credenciais:
- **Email:** admin@example.com
- **Senha:** admin123

### Nine-Box vazio

1. Verificar se há avaliações criadas
2. Certificar que campanhas têm `tipoAvaliacao` preenchido
3. Verificar console do navegador para erros

---

## 📊 Tabela de Referência - Nine-Box

| Posição | GridX | GridY | Nome Correto | Score Perf | Score Pot |
|---------|-------|-------|--------------|------------|-----------|
| Q1 | 1 | 1 | Insuficiente | ≤2.0 | ≤2.0 |
| Q2 | 1 | 2 | Questionável | ≤2.0 | ≤3.0 |
| Q3 | 2 | 1 | Eficaz | ≤3.0 | ≤2.0 |
| Q4 | 1 | 3 | Dilema | ≤2.0 | >3.0 |
| Q5 | 2 | 2 | Mantenedor | ≤3.0 | ≤3.0 |
| Q6 | 3 | 1 | Especialista | >3.0 | ≤2.0 |
| Q7 | 2 | 3 | Forte Candidato | ≤3.0 | >3.0 |
| Q8 | 3 | 2 | Alto Desempenho | >3.0 | ≤3.0 |
| Q9 | 3 | 3 | Estrela | >3.0 | >3.0 |

---

## 🎉 Tudo Passou?

Se todos os testes acima passaram, as correções estão **100% funcionais**!

### Próximos Passos

1. Deploy em ambiente de staging
2. Testar com dados reais
3. Deploy em produção
4. Monitorar por 24-48h

### Documentação Adicional

- **STATUS_FINAL_CORREÇÕES.md** - Status completo do projeto
- **GUIA_DE_TESTES.md** - Testes mais detalhados
- **EXEMPLOS_API.md** - Exemplos de uso da API

---

**Dúvidas?** Consulte os documentos de referência ou revise os comentários no código.
