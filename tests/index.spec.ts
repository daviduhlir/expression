import { assert, expect } from 'chai'
import { getByExpression, setByExpression } from '../dist'

describe('Get data', function() {
  it('Basic', async function() {
    const object = { something: [ {
          test: 'Hello world'
        }
      ]
    }
    const result = getByExpression(object, 'something[0].test')
    expect(result).to.equal('Hello world')
  })

  it('Array', async function() {
    const object = { something: [ {
          test: 'Hello world'
        }
      ]
    }
    const result = getByExpression(object, 'something[].test')
    expect(result[0]).to.equal('Hello world')
  })

})

describe('Set data', function() {
  it('Basic', async function() {
    const object = { something: [ {
          test: null
        }
      ]
    }
    setByExpression(object, 'something[0].test', 'Hello world')
    expect(object.something[0].test).to.equal('Hello world')
  })

  it('Array', async function() {
    const object = { something: [ {
          test: null
        }
      ]
    }
    setByExpression(object, 'something[].test', 'Hello world')
    expect(object.something[0].test).to.equal(null)
    expect(object.something[1].test).to.equal('Hello world')
  })

})
