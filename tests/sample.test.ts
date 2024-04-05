test('Object equality', () => {
  expect({ a: 1, b: 10 }).toStrictEqual({ b: 10, a: 1 });
});
