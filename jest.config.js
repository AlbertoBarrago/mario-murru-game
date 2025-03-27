export default {
    // Use ES modules
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js': '$1',
    },
    // Test environment
    testEnvironment: 'jsdom',
    // Test files pattern
    testMatch: ['**/tests/**/*.test.js'],
    // Coverage reporting
    collectCoverage: true,
    coverageDirectory: 'coverage',
    // Other options
    verbose: true
};