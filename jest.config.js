module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
        '\\.(jpg|jpeg|png|gif|webp|svg|mp3|wav)$': '<rootDir>/tests/mocks/fileMock.js'
    },
    testPathIgnorePatterns: ['/node_modules/']
};