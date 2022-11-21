import { expect } from 'chai'
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

  it('Array #1', async function() {
    const object = { something: [ {
          test: 'Hello world'
        }
      ]
    }
    const result = getByExpression(object, 'something[].test')
    expect(result[0]).to.equal('Hello world')
    expect(result.length).to.equal(1)
  })

  it('Array #2', async function() {
    const object = {
      nested: {
        property: [{
          something: [
            {
              test: [
                'A: Hello world 1',
                'A: Hello world 2',
              ]
            },
            {
              test: [
                'B: Hello world 1',
                'B: Hello world 2',
              ]
            }
          ]
        }]
      }
    }
    const result = getByExpression(object, 'nested.property[].something[].test[]')
    expect(result[0][0].length).to.equal(2)
    expect(result[0][1].length).to.equal(2)
    expect(result[0][0]).to.have.ordered.members(['A: Hello world 1', 'A: Hello world 2'])
    expect(result[0][1]).to.have.ordered.members(['B: Hello world 1', 'B: Hello world 2'])
  })

  it('Array #3', async function() {
    const object = { something:
      [
        {
          test: 'Hello world 1'
        },
        {
          test: 'Hello world 2'
        },
        {
          test: 'Hello world 3'
        }
      ]
    }
    const result = getByExpression(object, 'something[-1].test')
    expect(result).to.equal('Hello world 3')
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
    expect(object.something.length).to.equal(1)
  })

  it('Array', async function() {
    const object = { something: [ {
          test: null
        }
      ]
    }
    setByExpression(object, 'something[].test', 'Hello world')
    expect(object.something[0].test).to.equal('Hello world')
    expect(object.something.length).to.equal(1)
  })

  it('Array push', async function() {
    const object = { something: [ {
          test: null
        }
      ]
    }
    setByExpression(object, 'something[+].test', 'Hello world')
    expect(object.something[0].test).to.equal(null)
    expect(object.something[1].test).to.equal('Hello world')
    expect(object.something.length).to.equal(2)
  })

  it('Array add on first place', async function() {
    const object: {test: string}[] = [{test: 'test'}]
    setByExpression(object, '[+].test', 'Hello world')
    expect(object[0].test).to.equal('test')
    expect(object[1].test).to.equal('Hello world')
    expect(object.length).to.equal(2)
  })

  it('Array on first place', async function() {
    const object: {test: string}[] = [{test: 'test'}]
    setByExpression(object, '[].test', 'Hello world')
    expect(object[0].test).to.equal('Hello world')
    expect(object.length).to.equal(1)
  })

  it('Simple array', async function() {
    const object = [1, 2]
    setByExpression(object, '[]', 0)
    expect(object[0]).to.equal(0)
    expect(object[1]).to.equal(0)
    expect(object.length).to.equal(2)
  })

  it('Simple array add', async function() {
    const object = [1]
    setByExpression(object, '[+]', 2)
    expect(object[0]).to.equal(1)
    expect(object[1]).to.equal(2)
    expect(object.length).to.equal(2)
  })

})
