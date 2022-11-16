import { setByExpression, getByExpression } from '@david.uhlir/expression'

const object = {
  something: [
    {
      test: null
    }
  ]
}

setByExpression(object, 'something[0].test', 'Hello world')

const result = getByExpression(object, 'something[]')
console.log(result)
