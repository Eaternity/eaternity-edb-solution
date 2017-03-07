import {pipe, partial} from './utils'

const addTwo = (a, b) => a + b
const addThree = (a, b, c) => a + b + c
const increment = num => num + 1
const double = num => num * 2

test('partial applies the first argument ahead of time', () => {
  const inc = partial(addTwo, 30)
  const result = inc(12)
  expect(result).toBe(42)
})

test('partial applies multiple arguments ahead of time', () => {
  const inc = partial(addThree, 20, 10)
  const result = inc(12)
  expect(result).toBe(42)
})

test('pipe pipes the results of increment to double', () => {
  const pipeline = pipe(increment, double)
  const result = pipeline(20)
  expect(result).toBe(42)
})

test('pipe pipes the results of double to increment', () => {
  const pipeline = pipe(double, increment)
  const result = pipeline(20.5)
  expect(result).toBe(42)
})
