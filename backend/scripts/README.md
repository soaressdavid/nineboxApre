# Scripts manuais

Esta pasta contém scripts utilitários e de validação manual. **Não fazem parte do suite de testes automatizados** (`npm test`).

| Script | Propósito |
|--------|-----------|
| `quick-seed.js` | Popula o banco com dados mínimos para desenvolvimento |
| `test-api-corrections.js` | Validação manual das correções da API (legado) |
| `test-complete-validation.js` | Validação manual completa (legado) |
| `test-corrections.js` | Testes de correções específicas (legado) |
| `test-final-ninebox.js` | Validação do Nine Box (legado) |
| `test-ninebox-classification.js` | Testa a classificação do Nine Box (legado) |

## Como executar

```bash
node scripts/quick-seed.js
```

> Os scripts `test-*.js` marcados como **legado** podem ser removidos após confirmação de que os comportamentos estão cobertos pelos testes automatizados em `tests/`.
