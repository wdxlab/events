/* global module */

module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': '@swc/jest',
  },
  testPathIgnorePatterns: ['.*\\.js'],
};
