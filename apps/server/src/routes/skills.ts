import { Router } from 'express';

import { notFound } from '../lib/errors.js';
import { requestLanguage } from '../services/language.js';
import { optionalAuth } from '../services/sessions.js';
import { skillCards, skillFor } from '../services/skills.js';

/** Future skills: the subjects, and a subject's YouTube lessons with their summaries. */
export const skillsRouter = Router();

skillsRouter.get('/skills', optionalAuth, (req, res) => {
  res.json({ skills: skillCards(requestLanguage(req)) });
});

skillsRouter.get('/skills/:id', optionalAuth, (req, res) => {
  const skill = skillFor(String(req.params.id), requestLanguage(req));
  if (!skill) throw notFound('Subject not found');
  res.json({ skill });
});
