import { v4 as uuidv4 } from 'uuid';

export interface Meal {
  id: string;
  name: string;
  foods: string[];
  createdAt: string;
  updatedAt: string;
}

const meals: Map<string, Meal> = new Map();

export function getAllMeals(): Meal[] {
  return Array.from(meals.values());
}

export function getMealById(id: string): Meal | undefined {
  return meals.get(id);
}

export function createMeal(name: string, foods: string[]): Meal {
  const id = uuidv4();
  const now = new Date().toISOString();
  const meal: Meal = { id, name, foods, createdAt: now, updatedAt: now };
  meals.set(id, meal);
  return meal;
}

export function updateMeal(id: string, name: string, foods: string[]): Meal | undefined {
  const existing = meals.get(id);
  if (!existing) return undefined;
  existing.name = name;
  existing.foods = foods;
  existing.updatedAt = new Date().toISOString();
  return existing;
}

export function deleteMeal(id: string): boolean {
  return meals.delete(id);
}
