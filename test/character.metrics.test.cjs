const { test } = require('node:test');
const assert = require('node:assert/strict');
const { CharacterService } = require('../dist/character/character.service');
const { createCharacterMetrics } = require('../dist/character/character.metrics');
const { PrometheusMetricsService } = require('../dist/observability/metrics.service');

const input = {
  name: 'Luna', level: 1, experience_points: 0, health_points: 100,
  mana_points: 50, strength: 10, agility: 10, intelligence: 10, defense: 10,
};

function setup() {
  const metrics = new PrometheusMetricsService();
  const saved = { ...input, id: '42', create_time: new Date() };
  const repository = {
    createCharacter: async () => saved,
    updateCharacter: async () => saved,
    deleteCharacter: async () => true,
  };
  const service = new CharacterService(repository, createCharacterMetrics(metrics));
  return { metrics, repository, service };
}

async function assertCounts(metrics, created, updated, deleted) {
  const output = await metrics.metrics();
  for (const [name, value] of Object.entries({ created, updated, deleted })) {
    assert.match(output, new RegExp(`characters_${name}_total\\{[^}]*\\} ${value}(?:\\n|$)`));
  }
}

test('exports zero counters before activity and counts successful mutations', async () => {
  const { metrics, service } = setup();
  await assertCounts(metrics, 0, 0, 0);
  await service.createCharacter(input);
  await service.updateCharacter('42', { level: 2 });
  await service.updateCharacter('42', { level: 3 });
  await service.deleteCharacter('42');
  await assertCounts(metrics, 1, 2, 1);
});

test('does not count missing characters or validation failures', async () => {
  const { metrics, repository, service } = setup();
  repository.updateCharacter = async () => null;
  repository.deleteCharacter = async () => false;
  assert.equal(await service.updateCharacter('missing', { level: 2 }), null);
  assert.equal(await service.deleteCharacter('missing'), false);
  await assert.rejects(service.createCharacter({ ...input, level: 0 }));
  await assert.rejects(service.updateCharacter('42', {}));
  await assert.rejects(service.deleteCharacter(''));
  await assertCounts(metrics, 0, 0, 0);
});

test('preserves repository failures without incrementing counters', async () => {
  const { metrics, repository, service } = setup();
  const error = new Error('Database unavailable');
  for (const method of ['createCharacter', 'updateCharacter', 'deleteCharacter']) {
    repository[method] = async () => { throw error; };
  }
  await assert.rejects(service.createCharacter(input), error);
  await assert.rejects(service.updateCharacter('42', { level: 2 }), error);
  await assert.rejects(service.deleteCharacter('42'), error);
  await assertCounts(metrics, 0, 0, 0);
});
