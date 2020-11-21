const add = require('./add.js').add

describe('test add', () => {
    test('should return 2', () => {
        expect(add(1,1)).toBe(2)
    })
    test('should fail', () => {
        expect(add(1,4)).toBe(6)
    })
})