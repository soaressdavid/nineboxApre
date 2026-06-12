# 📊 Nine-Box Grid - Guia Visual

## 🎯 O que é o Nine-Box?

O Nine-Box é uma matriz 3x3 que mapeia colaboradores em 9 quadrantes baseados em:
- **Eixo X (horizontal):** Desempenho atual
- **Eixo Y (vertical):** Potencial futuro

---

## 📐 Grid Visual

```
                    NINE-BOX GRID
        ┌─────────────────────────────────────┐
        │                                     │
   3    │   Q4         Q7           Q9       │  ALTO
        │  Dilema    Candidato    Estrela    │  POTENCIAL
   P    │                                     │  (>3.0)
   O    │  [1-3]      [2-3]       [3-3]      │
   T    ├─────────────────────────────────────┤
   E    │                                     │
   N  2 │   Q2         Q5           Q8       │  MÉDIO
   C    │ Question.  Mantenedor  Alto Des.   │  POTENCIAL
   I    │                                     │  (≤3.0)
   A    │  [1-2]      [2-2]       [3-2]      │
   L    ├─────────────────────────────────────┤
        │                                     │
   1    │   Q1         Q3           Q6       │  BAIXO
        │ Insufic.    Eficaz    Especialista │  POTENCIAL
        │                                     │  (≤2.0)
        │  [1-1]      [2-1]       [3-1]      │
        └─────────────────────────────────────┘
           BAIXO      MÉDIO        ALTO
          (≤2.0)     (≤3.0)       (>3.0)
              DESEMPENHO (Performance)
```

---

## 📊 Thresholds de Classificação

### Score → Classificação → Grid Position

```
1.0 ─┬─
     │  BAIXO
2.0 ─┼─ Grid Position: 1
     │
2.1 ─┬─
     │  MÉDIO
3.0 ─┼─ Grid Position: 2
     │
3.1 ─┬─
     │  ALTO
4.0 ─┼─ Grid Position: 3
```

**Código:**
```javascript
if (score <= 2.0) return grid = 1;  // BAIXO
if (score <= 3.0) return grid = 2;  // MÉDIO
return grid = 3;                     // ALTO
```

---

## 🎨 Descrição dos Quadrantes

### Q1 (1-1) - Insuficiente 🔴
- **Desempenho:** Baixo (≤2.0)
- **Potencial:** Baixo (≤2.0)
- **Perfil:** Não atinge expectativas em desempenho nem demonstra potencial
- **Ação:** PIP ou desligamento

### Q2 (1-2) - Questionável 🟠
- **Desempenho:** Baixo (≤2.0)
- **Potencial:** Médio (≤3.0)
- **Perfil:** Tem potencial mas desempenho abaixo do esperado
- **Ação:** Feedback intensivo, plano de desenvolvimento

### Q3 (2-1) - Eficaz 🟡
- **Desempenho:** Médio (≤3.0)
- **Potencial:** Baixo (≤2.0)
- **Perfil:** Entrega resultados mas sem ambição de crescimento
- **Ação:** Manter satisfeito, bonificações, especialização

### Q4 (1-3) - Dilema ✨
- **Desempenho:** Baixo (≤2.0)
- **Potencial:** Alto (>3.0)
- **Perfil:** Muito potencial mas desempenho insuficiente
- **Ação:** Mentoria, identificar bloqueios, oportunidades de crescimento

### Q5 (2-2) - Mantenedor 💎
- **Desempenho:** Médio (≤3.0)
- **Potencial:** Médio (≤3.0)
- **Perfil:** Backbone da empresa, sólido e confiável
- **Ação:** Projetos desafiadores, desenvolvimento contínuo

### Q6 (3-1) - Especialista 🎯
- **Desempenho:** Alto (>3.0)
- **Potencial:** Baixo (≤2.0)
- **Perfil:** Expert na função mas sem interesse em cargos de gestão
- **Ação:** Reconhecimento técnico, plano de carreira Y (especialista)

### Q7 (2-3) - Forte Candidato ⭐
- **Desempenho:** Médio (≤3.0)
- **Potencial:** Alto (>3.0)
- **Perfil:** Muito promissor, em desenvolvimento
- **Ação:** Exposição, experiência, feedback contínuo

### Q8 (3-2) - Alto Desempenho 📈
- **Desempenho:** Alto (>3.0)
- **Potencial:** Médio (≤3.0)
- **Perfil:** Entrega excelentes resultados consistentemente
- **Ação:** Projetos de liderança, KPIs claros, monitoramento

### Q9 (3-3) - Estrela 🚀
- **Desempenho:** Alto (>3.0)
- **Potencial:** Alto (>3.0)
- **Perfil:** Top performer, pronto para promoção
- **Ação:** Sucessão, promoção, projetos estratégicos

---

## 📍 Exemplos Práticos

### Exemplo 1: João Silva
```json
{
  "nome": "João Silva",
  "avaliacoes_desempenho": [3.5, 3.8, 3.6],
  "avaliacoes_potencial": [2.8, 2.5, 2.7],
  
  "performance": 3.63,  // Média: (3.5+3.8+3.6)/3
  "potential": 2.67,    // Média: (2.8+2.5+2.7)/3
  
  "gridX": 3,           // 3.63 > 3.0 = ALTO
  "gridY": 2,           // 2.67 ≤ 3.0 = MÉDIO
  
  "categoria": "Q8 (Alto Desempenho)",
  "key": "3-2"
}
```

**Visualização:**
```
        │       │     ╔═══╗
        │       │     ║ Q9║
        ├───────┼─────╚═══╝
        │       │  👤 Q8
        │       │  João
        ├───────┼─────────
        │       │       
```

### Exemplo 2: Maria Santos
```json
{
  "nome": "Maria Santos",
  "avaliacoes_desempenho": [2.5, 2.3, 2.6],
  "avaliacoes_potencial": [3.7, 3.9, 3.5],
  
  "performance": 2.47,  // MÉDIO
  "potential": 3.70,    // ALTO
  
  "gridX": 2,
  "gridY": 3,
  
  "categoria": "Q7 (Forte Candidato)",
  "key": "2-3"
}
```

**Visualização:**
```
        │  👤   │       
        │ Maria │       
        │  Q7   │       
        ├───────┼─────
        │       │       
```

### Exemplo 3: Pedro Costa
```json
{
  "nome": "Pedro Costa",
  "avaliacoes_desempenho": [1.8, 1.9, 2.0],
  "avaliacoes_potencial": [1.5, 1.7, 1.6],
  
  "performance": 1.90,  // BAIXO
  "potential": 1.60,    // BAIXO
  
  "gridX": 1,
  "gridY": 1,
  
  "categoria": "Q1 (Insuficiente)",
  "key": "1-1"
}
```

**Visualização:**
```
        │       │       
        ├───────┼─────
        │       │       
        ├───────┼─────
   👤   │       │       
  Pedro │       │       
   Q1   │       │
```

---

## 🔄 Fluxo de Dados

### 1. Coleta de Avaliações
```
Avaliador → Preenche critérios (1-4) → Frontend
```

### 2. Cálculo de Média por Competência
```
Frontend → Média de critérios por competência → Backend
Exemplo: Liderança [3,4,3] → 3.33
```

### 3. Cálculo de Média Geral
```
Backend → Média das competências → Score final
Exemplo: {Liderança:3.33, Comunicação:2.5} → 2.92
```

### 4. Classificação
```
Backend → Aplica thresholds → BAIXO/MÉDIO/ALTO
Exemplo: 2.92 ≤ 3.0 → MÉDIO
```

### 5. Posicionamento no Grid
```
Backend → Converte para grid → gridX, gridY
Exemplo: MÉDIO → grid position 2
```

### 6. Categoria Final
```
Backend → Matriz Y-X → Categoria
Exemplo: MÉDIO-MÉDIO → Q5 (Mantenedor)
```

---

## 🎯 Mapeamento Backend ↔ Frontend

### Backend (ninebox.service.js)
```javascript
// Matriz usa formato: '${yClass}-${xClass}'
matriz = {
  'ALTO-BAIXO': 'Q4 (Dilema)',      // Y=3, X=1
  'ALTO-MÉDIO': 'Q7 (Candidato)',   // Y=3, X=2
  'ALTO-ALTO': 'Q9 (Estrela)',      // Y=3, X=3
  // ...
}
```

### Frontend (nine-box.html)
```javascript
// CATEGORIAS usa formato: '${gridX}-${gridY}'
CATEGORIAS = {
  '1-3': { nome: 'Q4 (Dilema)', ... },      // X=1, Y=3
  '2-3': { nome: 'Q7 (Candidato)', ... },   // X=2, Y=3
  '3-3': { nome: 'Q9 (Estrela)', ... },     // X=3, Y=3
  // ...
}
```

### ✅ Alinhamento (Issue #6 Corrigido)
- Backend: `'ALTO-BAIXO'` (Y-X) → Q4
- Frontend: gridX=1, gridY=3 → key `'1-3'` → Q4 ✅
- **Todos os 9 quadrantes agora estão alinhados!**

---

## 🧮 Tabela de Conversão Rápida

| Score | Classificação | Grid | Quadrante Baixo | Quadrante Médio | Quadrante Alto |
|-------|---------------|------|-----------------|-----------------|----------------|
| 1.0-2.0 | BAIXO | 1 | Q1 (Insuficiente) | Q2 (Questionável) | Q4 (Dilema) |
| 2.1-3.0 | MÉDIO | 2 | Q3 (Eficaz) | Q5 (Mantenedor) | Q7 (Candidato) |
| 3.1-4.0 | ALTO | 3 | Q6 (Especialista) | Q8 (Alto Des.) | Q9 (Estrela) |

---

## 🎨 Legenda de Cores (sugerida para UI)

```css
Q1 - Insuficiente:    #DC2626 (vermelho)
Q2 - Questionável:    #EA580C (laranja escuro)
Q3 - Eficaz:          #F59E0B (amarelo/ouro)
Q4 - Dilema:          #A855F7 (roxo)
Q5 - Mantenedor:      #3B82F6 (azul)
Q6 - Especialista:    #10B981 (verde)
Q7 - Forte Candidato: #8B5CF6 (violeta)
Q8 - Alto Desempenho: #06B6D4 (ciano)
Q9 - Estrela:         #FBBF24 (dourado brilhante)
```

---

## 📝 Checklist de Validação Visual

Ao testar o nine-box no frontend, verifique:

- [ ] Pessoas com score ≤2.0 aparecem na coluna/linha 1
- [ ] Pessoas com score ≤3.0 aparecem na coluna/linha 2
- [ ] Pessoas com score >3.0 aparecem na coluna/linha 3
- [ ] Modal mostra nome correto do quadrante
- [ ] Perfil do quadrante faz sentido para a posição
- [ ] Ações sugeridas são apropriadas
- [ ] Não há pessoas em quadrantes errados
- [ ] Filtro gestor/colaborador funciona
- [ ] Badges de "inferido" aparecem quando apropriado

---

## 🚀 Resultado Final

Com as correções aplicadas:
- ✅ Backend e frontend usam mesmos thresholds
- ✅ Mapeamento de categorias está 100% alinhado
- ✅ Fallback de conversão funciona corretamente
- ✅ Todos os 9 quadrantes mostram informações corretas

**Status: Pronto para uso em produção! 🎉**
