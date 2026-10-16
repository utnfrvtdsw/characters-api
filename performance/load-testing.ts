import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const requestParams = {
  tags: { name: 'GET /api/characters' },
  timeout: '5s',
};
export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99'],
  },
};

export function setup() {
  const res = http.get(`${baseUrl}/api/characters`, requestParams);
  if (res.status !== 200) {
    throw new Error(
      `La API no está disponible en ${baseUrl}/api/characters ` +
      `(status ${res.status}: ${res.error || res.status_text}). ` +
      'Iniciá la API y verificá BASE_URL antes de ejecutar el test.',
    );
  }

  let body;
  try { body = res.json(); } catch { body = null; }
  if (!Array.isArray(body)) {
    throw new Error('GET /api/characters debe devolver un array JSON.');
  }
}

export default function () {
  const res = http.get(`${baseUrl}/api/characters`, requestParams);
  let body;
  try { body = res.json(); } catch { body = null; }
  check(res, {
    'status 200': (r) => r.status === 200,
    'devuelve un array': () => Array.isArray(body),
  });
  sleep(0.2);
}
