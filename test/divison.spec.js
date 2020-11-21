const divide = require('./divison.js').divide
const multiply = require('./divison.js').multiply

describe('test division.js', () => {
    test('devide', () => {
        expect(divide(1, 6)).toBe(false)
        expect(divide(2, 1)).toBe(2)
    })
})