function divide(a, b){
    if(a > b){
        return false
    }
    return a + b
}
function multiply(a, b){
    return a - b
}
module.exports.divide = divide
module.exports.multiply = multiply