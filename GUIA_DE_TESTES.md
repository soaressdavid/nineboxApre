# Guia de Testes - Correções do Sistema de Avaliação

Este documento descreve como testar todas as correções aplicadas ao sistema.

## Pré-requisitos

1. Backend rodando em `http://localhost:3000`
2. Frontend acessível
3. Banco de dados com dados de teste (usuários, campanhas, avaliações)

## 1. Testar Correção #2 - Update de Avaliação (CRÍTICO)

### Antes da correção:
- ❌ Editar uma avaliação existente causava crash com erro `campaign.criterios is undefined`

### Depois da correção:
- ✅ Deve ser possível editar avaliações sem erro

### Como testar:

```bash
# 1. Criar uma avaliação de teste (via API ou frontend)
curl -X POST http://localhost:3000/api/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "campaignId": "CAMPAIGN_ID",
    "avaliadoId": "USER_ID",
    "criterios": {
      "Liderança": 3.5,
      "Comunicação": 2.8
    },
    "comentario": "Bom desempenho geral"
  }'

# 2. Editar a avaliação (antes crashava, agora deve funcionar)
curl -X PUT http://localhost:3000/api/evaluations/EVALUATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "criterios": {
      "Liderança": 4.0,
      "Comunicação": 3.2
    },
    "comentario": "Desempenho melhorado"
  }'
```

### Resultado esperado:
- Status 200
- Avaliação atualizada com novos valores
- Sem erros no console do backend

---

## 2. Testar Correção #6 - CATEGORIAS Nine-Box (CRÍTICO)

### Antes da correção:
- ❌ 6 de 9 quadrantes mostravam nomes errados no modal

### Depois da correção:
- ✅ Todos os quadrantes mostram os nomes corretos

### Mapeamento correto:

| Posição | gridX | gridY | Desempenho | Potencial | Nome Correto |
|---------|-------|-------|------------|-----------|--------------|
| Q1 | 1 | 1 | Baixo | Baixo | Q1 (Insuficiente) |
| Q2 | 1 | 2 | Baixo | Médio | Q2 (Questionável) |
| Q3 | 2 | 1 | Médio | Baixo | Q3 (Eficaz) |
| Q4 | 1 | 3 | Baixo | Alto | Q4 (Dilema) |
| Q5 | 2 | 2 | Médio | Médio | Q5 (Mantenedor) |
| Q6 | 3 | 1 | Alto | Baixo | Q6 (Especialista) |
| Q7 | 2 | 3 | Médio | Alto | Q7 (Forte Candidato) |
| Q8 | 3 | 2 | Alto | Médio | Q8 (Alto Desempenho) |
| Q9 | 3 | 3 | Alto | Alto | Q9 (Estrela) |

### Como testar:

1. **Preparar dados de teste:**
   - Criar campanhas de "desempenho" e "potencial"
   - Criar avaliações com scores específicos para cada quadrante:
     - Score ≤ 2.0 = Baixo (gridX/Y = 1)
     - Score ≤ 3.0 = Médio (gridX/Y = 2)
     - Score > 3.0 = Alto (gridX/Y = 3)

2. **Acessar a página Nine-Box:**
   ```
   http://localhost:PORTA/frontend-ref/pages/nine-box.html
   ```

3. **Verificar cada quadrante:**
   - Clicar em cada pessoa no grid
   - Verificar se o modal mostra o nome correto
   - Comparar com a tabela acima

### Exemplo de teste com SQL:

```sql
-- Criar usuário de teste
INSERT INTO users (id, ra, nome, email, senha, tipo) 
VALUES ('test-user-1', 'RA001', 'Teste Usuario', 'teste@test.com', 'hash', 'colaborador');

-- Criar campanhas
INSERT INTO evaluation_campaigns (id, nome, "dataInicio", "dataFim", "tipoAlvo", "tipoAvaliacao", status)
VALUES 
  ('camp-desemp', 'Campanha Desempenho', NOW(), NOW() + INTERVAL '30 days', 'colaborador', 'desempenho', 'ativa'),
  ('camp-potenc', 'Campanha Potencial', NOW(), NOW() + INTERVAL '30 days', 'colaborador', 'potencial', 'ativa');

-- Criar avaliação de desempenho BAIXO (1.8) e potencial ALTO (3.5)
-- Deve aparecer em Q4 (Dilema) = gridX:1, gridY:3
INSERT INTO evaluations (id, "campaignId", "avaliadorId", "avaliadoId", criterios, media)
VALUES 
  (gen_random_uuid(), 'camp-desemp', 'avaliador-id', 'test-user-1', '{}', 1.8),
  (gen_random_uuid(), 'camp-potenc', 'avaliador-id', 'test-user-1', '{}', 3.5);
```

---

## 3. Testar Correção #7 - Fallback de Conversão (MÉDIO)

### Antes da correção:
- ❌ Código tinha branch inacessível `s > 4 ? s <= 4 : ...`
- ❌ Thresholds errados (≤1.5, ≤2.5)

### Depois da correção:
- ✅ Thresholds corretos (≤2.0, ≤3.0)

### Como testar:

1. **Criar registros antigos sem gridX/gridY:**
   ```sql
   -- Forçar valores nulos em gridX/gridY para testar fallback
   UPDATE nine_box 
   SET "gridX" = NULL, "gridY" = NULL
   WHERE "pessoaId" = 'test-user-id';
   ```

2. **Acessar o Nine-Box e verificar:**
   - Pessoas devem aparecer na posição correta mesmo sem gridX/gridY
   - Score 1.5 → grid 1 (BAIXO) ✅
   - Score 2.0 → grid 1 (BAIXO) ✅
   - Score 2.5 → grid 2 (MÉDIO) ✅
   - Score 3.0 → grid 2 (MÉDIO) ✅
   - Score 3.5 → grid 3 (ALTO) ✅

---

## 4. Testar Correção #1 - Validação de Critérios (BAIXO)

### Antes da correção:
- ⚠️ Critérios faltando no localStorage podiam ser silenciosamente descartados

### Depois da correção:
- ✅ Warning no console quando há critérios faltando

### Como testar:

1. **Iniciar uma avaliação:**
   - Ir para responder-avaliacao.html
   - Preencher alguns critérios (mas não todos)

2. **Fechar o navegador** (para salvar no localStorage)

3. **Reabrir a página**

4. **Finalizar sem preencher todos os critérios**

5. **Verificar console do navegador:**
   ```
   ⚠️ Competency "Nome da Competência" has incomplete criteria: 2/4 answered. 
      This may indicate sparse array data loss from localStorage restoration.
   ```

---

## 5. Testar Correção #3 - Documentação da Média (DOC)

### Como testar:

1. **Abrir o arquivo:**
   ```
   backend/src/modules/evaluations/evaluation.service.js
   ```

2. **Procurar pelo cálculo da média (linha ~100):**
   - Deve haver comentário explicando "mean of means"
   - Deve mencionar que cada competência tem peso igual

3. **Testar o comportamento:**
   ```javascript
   // Competência A: 3 critérios = [2, 3, 4] → média 3.0
   // Competência B: 1 critério  = [4]       → média 4.0
   // Média final = (3.0 + 4.0) / 2 = 3.5
   // (não é (2+3+4+4) / 4 = 3.25)
   ```

---

## 6. Testar Correção #4 - Comentário de Thresholds (DOC)

### Como verificar:

1. **Abrir o arquivo:**
   ```
   backend/src/modules/ninebox/ninebox.service.js
   ```

2. **Procurar pelo método `calculateCategoria` (linha ~30):**
   - ✅ Deve dizer: "Usa classifyScore: BAIXO (≤2.0), MÉDIO (≤3.0), ALTO (>3.0)"
   - ❌ Não deve dizer: "BAIXO (1-1.5), MÉDIO (1.6-2.5), ALTO (2.6-4)"

---

## 7. Teste End-to-End Completo

### Cenário: Criar avaliação e visualizar no Nine-Box

1. **Login como Admin**

2. **Criar campanhas:**
   - Campanha de Desempenho (ativa)
   - Campanha de Potencial (ativa)

3. **Criar usuário de teste:**
   - Nome: "João Silva"
   - Tipo: Colaborador

4. **Fazer avaliação de Desempenho:**
   - Score médio: 3.8 (Alto)
   - Espera-se: gridX = 3

5. **Fazer avaliação de Potencial:**
   - Score médio: 2.5 (Médio)
   - Espera-se: gridY = 2

6. **Acessar Nine-Box:**
   - João Silva deve aparecer em Q8 (Alto Desempenho)
   - Posição: gridX=3 (coluna direita), gridY=2 (linha do meio)
   - Modal deve mostrar: "Q8 (Alto Desempenho)"

7. **Editar a avaliação de Desempenho:**
   - Alterar score para 2.0 (Baixo)
   - Atualizar

8. **Recarregar Nine-Box:**
   - João Silva deve mover para Q5 (Mantenedor)
   - Posição: gridX=1, gridY=2
   - Modal deve mostrar: "Q5 (Mantenedor)" ← ANTES mostrava erro!

---

## Checklist de Validação

- [ ] ✅ PUT /evaluations/:id funciona sem crash
- [ ] ✅ Nine-Box mostra Q1 (Insuficiente) em posição 1-1
- [ ] ✅ Nine-Box mostra Q2 (Questionável) em posição 1-2
- [ ] ✅ Nine-Box mostra Q3 (Eficaz) em posição 2-1
- [ ] ✅ Nine-Box mostra Q4 (Dilema) em posição 1-3
- [ ] ✅ Nine-Box mostra Q5 (Mantenedor) em posição 2-2
- [ ] ✅ Nine-Box mostra Q6 (Especialista) em posição 3-1
- [ ] ✅ Nine-Box mostra Q7 (Forte Candidato) em posição 2-3
- [ ] ✅ Nine-Box mostra Q8 (Alto Desempenho) em posição 3-2
- [ ] ✅ Nine-Box mostra Q9 (Estrela) em posição 3-3
- [ ] ✅ Fallback converte scores com thresholds corretos (2.0, 3.0)
- [ ] ✅ Warning aparece no console quando critérios estão incompletos
- [ ] ✅ Documentação explica "mean of means"
- [ ] ✅ Comentário usa thresholds corretos (≤2.0, ≤3.0)

---

## Casos de Teste SQL

```sql
-- Limpar dados de teste
DELETE FROM evaluations WHERE "avaliadoId" IN (SELECT id FROM users WHERE email LIKE '%@test.com');
DELETE FROM users WHERE email LIKE '%@test.com';

-- Criar 9 usuários para cobrir todos os quadrantes
INSERT INTO users (id, ra, nome, email, senha, tipo) VALUES
  ('user-q1', 'Q1', 'Usuario Q1', 'q1@test.com', 'hash', 'colaborador'),
  ('user-q2', 'Q2', 'Usuario Q2', 'q2@test.com', 'hash', 'colaborador'),
  ('user-q3', 'Q3', 'Usuario Q3', 'q3@test.com', 'hash', 'colaborador'),
  ('user-q4', 'Q4', 'Usuario Q4', 'q4@test.com', 'hash', 'colaborador'),
  ('user-q5', 'Q5', 'Usuario Q5', 'q5@test.com', 'hash', 'colaborador'),
  ('user-q6', 'Q6', 'Usuario Q6', 'q6@test.com', 'hash', 'colaborador'),
  ('user-q7', 'Q7', 'Usuario Q7', 'q7@test.com', 'hash', 'colaborador'),
  ('user-q8', 'Q8', 'Usuario Q8', 'q8@test.com', 'hash', 'colaborador'),
  ('user-q9', 'Q9', 'Usuario Q9', 'q9@test.com', 'hash', 'colaborador');

-- Criar avaliações com scores específicos
-- Q1: Baixo-Baixo (1.5, 1.5)
-- Q2: Baixo-Médio (1.5, 2.5)
-- Q3: Médio-Baixo (2.5, 1.5)
-- Q4: Baixo-Alto (1.5, 3.5)
-- Q5: Médio-Médio (2.5, 2.5)
-- Q6: Alto-Baixo (3.5, 1.5)
-- Q7: Médio-Alto (2.5, 3.5)
-- Q8: Alto-Médio (3.5, 2.5)
-- Q9: Alto-Alto (3.5, 3.5)
```

---

## Observações Importantes

1. **Thresholds:**
   - Baixo: score ≤ 2.0 → grid 1
   - Médio: 2.0 < score ≤ 3.0 → grid 2
   - Alto: score > 3.0 → grid 3

2. **Eixos:**
   - X (horizontal) = Desempenho (performance)
   - Y (vertical) = Potencial (potential)

3. **Chave do frontend:**
   - Formato: `'${gridX}-${gridY}'`
   - Exemplo: performance=Alto(3), potential=Médio(2) → chave '3-2' → Q8

4. **Backend matriz:**
   - Formato: `'${yClass}-${xClass}'`
   - Exemplo: MÉDIO-ALTO → Q8 (Alto Desempenho)
