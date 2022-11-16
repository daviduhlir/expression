# Set or gets value by expression

This set/get function can set/get any value. Special feature is work with arrays.
You can use empty brackets ([]) as wildcard to get value. If there will be more posible values, it will be returned as array.
For setting its similar, if you will use [] for set value, it will automaticaly creates array if does not exists, and push it to the end of it.

example:
```ts
const object = {
  something: [
    {
      test: null
    }
  ]
}

setByExpression(object, 'something[0].test', 'Hello world')

const result = getByExpression(object, 'something[]')

// result should be:
// [{ test: 'Hello world }]
```