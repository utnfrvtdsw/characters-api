module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': 'babel-jest' },
  clearMocks: true,
  verbose: true,
  testTimeout: 15000,
  collectCoverageFrom: [
    'src/character/character.service.ts',
    'src/character/character.repository.postgres.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],
};
