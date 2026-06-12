import Joi from 'joi';

// Critérios são dinâmicos (definidos pela campanha), então aceitamos qualquer objeto
// com chaves string e valores numéricos. A validação de escala é feita no service.
const createEvaluationSchema = Joi.object({
  campaignId: Joi.string().uuid().required(),
  avaliadoId: Joi.string().uuid().required(),
  // criterios: { [nomeCriterio]: nota (number) } — escala 1-4
  criterios: Joi.object().pattern(
    Joi.string(),
    Joi.number().min(1).max(4)
  ).min(1).required(),
  comentario: Joi.string().optional().allow('', null),
  anonima: Joi.boolean().optional().default(true)
});

const updateEvaluationSchema = Joi.object({
  criterios: Joi.object().pattern(
    Joi.string(),
    Joi.number().min(1).max(4)
  ).optional(),
  comentario: Joi.string().optional().allow('', null)
}).min(1);

export { createEvaluationSchema, updateEvaluationSchema };
