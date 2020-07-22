/* global module */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {},
  },
  moduleNameMapper: {
    '@kofein/(.+)$': '<rootDir>packages/$1/lib',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: ['.*\\.js'],
};
