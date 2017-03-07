// yeah, some functional programming! I'm such a hipster ;-)
// Stolen from these tutorials because it seemed a perfect fit:
// http://bit.ly/2mOnt8b http://bit.ly/2mUqCT6

// ...args means two different things here: First time it's a rest operator,
// collecting all arguments passed to the function into an array, second time
// it's a spread operator that passes all arguments from the arguments array
// into f() seperately.
export const partial = (fn, ...args) => fn.bind(null, ...args)

const _pipe = (f, g) => (...args) => g(f(...args))

export const pipe = (...fns) => fns.reduce(_pipe)
