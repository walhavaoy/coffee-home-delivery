import { Router } from 'express';
import { getAllMeals, createMeal, updateMeal, deleteMeal } from '../store';

const router = Router();

router.get('/', (_req, res) => {
  const meals = getAllMeals();
  res.json({ meals });
});

router.post('/', (req, res) => {
  const body = req.body as Record<string, unknown>;
  const name = body['name'];
  const foods = body['foods'];

  if (name === undefined || name === null) {
    res.status(400).json({ error: 'name is required', field: 'name' });
    return;
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'name must be a non-empty string', field: 'name' });
    return;
  }

  if (foods === undefined || foods === null) {
    res.status(400).json({ error: 'foods is required', field: 'foods' });
    return;
  }
  if (!Array.isArray(foods)) {
    res.status(400).json({ error: 'foods must be an array', field: 'foods' });
    return;
  }
  for (const item of foods) {
    if (typeof item !== 'string') {
      res.status(400).json({ error: 'each food must be a string', field: 'foods' });
      return;
    }
  }

  const meal = createMeal(name.trim(), foods as string[]);
  res.status(201).json(meal);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const body = req.body as Record<string, unknown>;
  const name = body['name'];
  const foods = body['foods'];

  if (name === undefined || name === null) {
    res.status(400).json({ error: 'name is required', field: 'name' });
    return;
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'name must be a non-empty string', field: 'name' });
    return;
  }

  if (foods === undefined || foods === null) {
    res.status(400).json({ error: 'foods is required', field: 'foods' });
    return;
  }
  if (!Array.isArray(foods)) {
    res.status(400).json({ error: 'foods must be an array', field: 'foods' });
    return;
  }
  for (const item of foods) {
    if (typeof item !== 'string') {
      res.status(400).json({ error: 'each food must be a string', field: 'foods' });
      return;
    }
  }

  const meal = updateMeal(id, (name as string).trim(), foods as string[]);
  if (!meal) {
    res.status(404).json({ error: 'Meal not found' });
    return;
  }
  res.json(meal);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = deleteMeal(id);
  if (!deleted) {
    res.status(404).json({ error: 'Meal not found' });
    return;
  }
  res.json({ deleted: id });
});

export default router;
