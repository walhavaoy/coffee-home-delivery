import request from 'supertest';
import { createApp } from './index';

const app = createApp();

describe('Meals CRUD', () => {
  let mealId: string;

  it('GET /api/meals returns empty array', async () => {
    const res = await request(app).get('/api/meals');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ meals: [] });
  });

  it('POST /api/meals creates a meal', async () => {
    const res = await request(app)
      .post('/api/meals')
      .send({ name: 'Breakfast', foods: ['eggs', 'toast'] });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Breakfast');
    expect(res.body.foods).toEqual(['eggs', 'toast']);
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
    mealId = res.body.id;
  });

  it('GET /api/meals returns the created meal', async () => {
    const res = await request(app).get('/api/meals');
    expect(res.status).toBe(200);
    expect(res.body.meals).toHaveLength(1);
    expect(res.body.meals[0].name).toBe('Breakfast');
  });

  it('POST /api/meals validates name required', async () => {
    const res = await request(app)
      .post('/api/meals')
      .send({ foods: ['eggs'] });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'name is required', field: 'name' });
  });

  it('POST /api/meals validates name non-empty', async () => {
    const res = await request(app)
      .post('/api/meals')
      .send({ name: '', foods: ['eggs'] });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'name must be a non-empty string', field: 'name' });
  });

  it('POST /api/meals validates foods required', async () => {
    const res = await request(app)
      .post('/api/meals')
      .send({ name: 'Lunch' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'foods is required', field: 'foods' });
  });

  it('POST /api/meals validates foods is array', async () => {
    const res = await request(app)
      .post('/api/meals')
      .send({ name: 'Lunch', foods: 'not-array' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'foods must be an array', field: 'foods' });
  });

  it('POST /api/meals validates each food is string', async () => {
    const res = await request(app)
      .post('/api/meals')
      .send({ name: 'Lunch', foods: [123] });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'each food must be a string', field: 'foods' });
  });

  it('PUT /api/meals/:id updates a meal', async () => {
    const res = await request(app)
      .put(`/api/meals/${mealId}`)
      .send({ name: 'Brunch', foods: ['eggs', 'toast', 'bacon'] });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Brunch');
    expect(res.body.foods).toEqual(['eggs', 'toast', 'bacon']);
    expect(res.body.id).toBe(mealId);
  });

  it('PUT /api/meals/:id returns 404 for missing meal', async () => {
    const res = await request(app)
      .put('/api/meals/nonexistent')
      .send({ name: 'X', foods: ['y'] });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Meal not found' });
  });

  it('DELETE /api/meals/:id deletes a meal', async () => {
    const res = await request(app).delete(`/api/meals/${mealId}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: mealId });
  });

  it('DELETE /api/meals/:id returns 404 for missing meal', async () => {
    const res = await request(app).delete(`/api/meals/${mealId}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Meal not found' });
  });

  it('GET /healthz returns ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
