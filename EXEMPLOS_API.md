# Exemplos de Uso da API - Sistema de Avaliação

## 🔐 Autenticação

Todas as requisições precisam do header de autenticação:
```bash
Authorization: Bearer <seu_token_jwt>
```

---

## 📝 Criar Avaliação

### POST /api/evaluations

**Request:**
```json
{
  "campaignId": "uuid-da-campanha",
  "avaliadoId": "uuid-do-avaliado",
  "criterios": {
    "Liderança": 3.5,
    "Comunicação": 2.8,
    "Trabalho em Equipe": 4.0
  },
  "comentario": "Demonstra boa liderança e comunicação eficaz."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-gerado",
    "campaignId": "uuid-da-campanha",
    "avaliadorId": "seu-user-id",
    "avaliadoId": "uuid-do-avaliado",
    "criterios": {
      "Liderança": 3.5,
      "Comunicação": 2.8,
      "Trabalho em Equipe": 4.0
    },
    "media": 3.43,
    "comentario": "Demonstra boa liderança e comunicação eficaz.",
    "data": "2026-06-12T10:30:00Z",
    "avaliado": {
      "id": "uuid",
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "tipo": "colaborador"
    },
    "campaign": {
      "id": "uuid",
      "nome": "Avaliação Q2 2026",
      "tipoAvaliacao": "desempenho"
    }
  }
}
```

**Notas:**
- A `media` é calculada automaticamente como média das médias das competências
- Cada valor em `criterios` deve estar entre 1.0 e 4.0
- O campo `avaliadorId` é preenchido automaticamente com o usuário logado

---

## ✏️ Editar Avaliação (CORRIGIDO)

### PUT /api/evaluations/:id

**Request:**
```json
{
  "criterios": {
    "Liderança": 4.0,
    "Comunicação": 3.2,
    "Trabalho em Equipe": 3.8
  },
  "comentario": "Melhorias significativas observadas."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "criterios": {
      "Liderança": 4.0,
      "Comunicação": 3.2,
      "Trabalho em Equipe": 3.8
    },
    "media": 3.67,
    "comentario": "Melhorias significativas observadas.",
    "updatedAt": "2026-06-12T11:00:00Z"
  }
}
```

**✅ Issue #2 Corrigida:**
Antes, esta chamada falhava com erro `campaign.criterios is undefined`.
Agora funciona corretamente usando `campaign.competencias`.

---

## 📊 Calcular Nine-Box para Todos (Admin)

### GET /api/ninebox/calculate/all

**Response (200):**
```json
{
  "success": true,
  "data": {
    "team": [
      {
        "avaliadoId": "user-1",
        "performance": 3.5,
        "potential": 2.8,
        "gridX": 3,
        "gridY": 2,
        "categoria": "Q8 (Alto Desempenho)",
        "performanceReal": 3.5,
        "potentialReal": 2.8,
        "performanceInferido": false,
        "potentialInferido": false,
        "pessoa": {
          "id": "user-1",
          "nome": "Maria Santos",
          "email": "maria@empresa.com",
          "tipo": "colaborador",
          "cargo": "Analista Senior",
          "departamento": "TI"
        }
      },
      {
        "avaliadoId": "user-2",
        "performance": 2.5,
        "potential": 3.8,
        "gridX": 2,
        "gridY": 3,
        "categoria": "Q7 (Forte Candidato)",
        "performanceReal": 2.5,
        "potentialReal": 3.8,
        "performanceInferido": false,
        "potentialInferido": false,
        "pessoa": {
          "id": "user-2",
          "nome": "Pedro Oliveira",
          "email": "pedro@empresa.com",
          "tipo": "gestor",
          "cargo": "Coordenador",
          "departamento": "Vendas"
        }
      }
    ],
    "total": 2
  }
}
```

**Campos Importantes:**
- `gridX`: Posição horizontal (1=Baixo, 2=Médio, 3=Alto Desempenho)
- `gridY`: Posição vertical (1=Baixo, 2=Médio, 3=Alto Potencial)
- `categoria`: Nome do quadrante (Q1-Q9)
- `performanceInferido`: true se usou score de potencial como fallback
- `potentialInferido`: true se usou score de desempenho como fallback

---

## 🎯 Calcular Nine-Box do Time (Gestor)

### GET /api/ninebox/calculate/team

Retorna o nine-box de todos os subordinados do gestor logado.

**Response:** Mesmo formato de `/calculate/all`, mas filtrado.

---

## 📈 Buscar Avaliações de um Usuário

### GET /api/evaluations/by-avaliado/:avaliadoId

**Query params (opcional):**
- `page` (default: 1)
- `limit` (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "evaluations": [
      {
        "id": "eval-1",
        "campaignId": "camp-1",
        "avaliadoId": "user-1",
        "criterios": {
          "Liderança": 3.5,
          "Comunicação": 2.8
        },
        "media": 3.15,
        "comentario": "Bom desempenho",
        "data": "2026-06-01T10:00:00Z",
        "campaign": {
          "nome": "Avaliação Q2 2026",
          "tipoAvaliacao": "desempenho"
        },
        "avaliado": {
          "nome": "Maria Santos",
          "email": "maria@empresa.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

---

## 🔍 Compreender os Scores

### Escala de Avaliação (1-4)

| Score | Classificação | Grid Position | Descrição |
|-------|---------------|---------------|-----------|
| 1.0 | Ruim | - | Não atende expectativas |
| 2.0 | Regular | ≤2.0 = BAIXO (1) | Atende parcialmente |
| 3.0 | Bom | ≤3.0 = MÉDIO (2) | Atende expectativas |
| 4.0 | Excelente | >3.0 = ALTO (3) | Supera expectativas |

### Thresholds (✅ Issue #4 e #7 Corrigidos)

```javascript
// Backend e Frontend agora usam os mesmos thresholds:
if (score <= 2.0) return 'BAIXO';   // grid position 1
if (score <= 3.0) return 'MÉDIO';   // grid position 2
return 'ALTO';                       // grid position 3
```

---

## 🗂️ Quadrantes do Nine-Box (✅ Issue #6 Corrigido)

### Mapeamento Grid → Categoria

| Grid | Desemp. | Potenc. | Categoria | Perfil |
|------|---------|---------|-----------|--------|
| 1-1 | Baixo | Baixo | Q1 (Insuficiente) | Desempenho e potencial baixos |
| 1-2 | Baixo | Médio | Q2 (Questionável) | Potencial mediano mas desempenho baixo |
| 2-1 | Médio | Baixo | Q3 (Eficaz) | Bom desempenho mas potencial limitado |
| 1-3 | Baixo | Alto | Q4 (Dilema) | Alto potencial mas desempenho baixo |
| 2-2 | Médio | Médio | Q5 (Mantenedor) | Performance equilibrada |
| 3-1 | Alto | Baixo | Q6 (Especialista) | Excelente na função mas sem ambição |
| 2-3 | Médio | Alto | Q7 (Forte Candidato) | Alto potencial, em desenvolvimento |
| 3-2 | Alto | Médio | Q8 (Alto Desempenho) | Excelente desempenho, bom potencial |
| 3-3 | Alto | Alto | Q9 (Estrela) | Top performer com alto potencial |

### Exemplo Prático

```json
{
  "performance": 3.8,  // Alto desempenho (>3.0)
  "potential": 2.5,    // Potencial médio (≤3.0)
  "gridX": 3,          // Coluna direita (Alto)
  "gridY": 2,          // Linha do meio (Médio)
  "categoria": "Q8 (Alto Desempenho)"
}
```

**Frontend key:** `'3-2'` → CATEGORIAS['3-2'] → Q8 ✅

---

## 🧮 Cálculo da Média (Issue #3 Documentado)

### Como funciona:

1. **Frontend calcula média por competência:**
   ```javascript
   // Competência "Liderança" com 3 critérios: [3, 4, 3]
   mediaLideranca = (3 + 4 + 3) / 3 = 3.33
   
   // Competência "Comunicação" com 2 critérios: [2, 3]
   mediaComunicacao = (2 + 3) / 2 = 2.5
   ```

2. **Backend calcula média das médias:**
   ```javascript
   // Critérios recebidos: { "Liderança": 3.33, "Comunicação": 2.5 }
   mediaFinal = (3.33 + 2.5) / 2 = 2.92
   ```

**⚠️ Importante:** 
Cada competência tem **peso igual**, independente de quantos critérios possui.

Se precisar de média ponderada, isso deve ser calculado no frontend antes de enviar.

---

## ❌ Erros Comuns

### 1. Editar avaliação sem critérios válidos

**Request:**
```json
{
  "criterios": {
    "CompetenciaInexistente": 3.5
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Critério 'CompetenciaInexistente' não está definido na campanha"
}
```

### 2. Score fora da escala

**Request:**
```json
{
  "criterios": {
    "Liderança": 5.0  // Máximo é 4.0
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Score deve estar entre 1.0 e 4.0"
}
```

### 3. Tentar avaliar sem permissão

**Response (403):**
```json
{
  "success": false,
  "message": "Você não tem permissão para avaliar esta pessoa"
}
```

---

## 🧪 Testar com cURL

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "senha": "senha123"
  }'
```

### 2. Criar Avaliação
```bash
TOKEN="seu-token-jwt"

curl -X POST http://localhost:3000/api/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "campaignId": "uuid-campanha",
    "avaliadoId": "uuid-usuario",
    "criterios": {
      "Liderança": 3.5,
      "Comunicação": 2.8
    }
  }'
```

### 3. Editar Avaliação (CORRIGIDO ✅)
```bash
curl -X PUT http://localhost:3000/api/evaluations/uuid-avaliacao \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "criterios": {
      "Liderança": 4.0,
      "Comunicação": 3.2
    }
  }'
```

### 4. Ver Nine-Box
```bash
curl -X GET http://localhost:3000/api/ninebox/calculate/all \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Referências

- **CORREÇÕES_APLICADAS.md** - Detalhes técnicos das correções
- **GUIA_DE_TESTES.md** - Testes manuais e SQL
- **RESUMO_EXECUTIVO.md** - Visão geral do projeto
