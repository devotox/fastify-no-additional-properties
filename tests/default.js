const test = require('tape')
const fastify = require('fastify')
const noAdditionalProperties = require('../index')

function buildFastify () {
  const schema = {
    type: 'object',
    properties: {
      a: {
        type: 'integer'
      }
    },
    required: ['a']
  }

  const app = fastify()

  app.register(noAdditionalProperties, {
    body: true,
    headers: true,
    params: true,
    query: true
  })

  app.route({
    method: 'POST',
    url: '/foo/:a/:b',
    handler (request, reply) {
      reply.send({
        body: request.body,
        headers: request.headers,
        params: request.params,
        query: request.query
      })
    },
    schema: {
      body: schema,
      headers: schema,
      params: schema,
      querystring: schema
    }
  })

  return app
}

test('default', t => {
  t.plan(10)

  const app = buildFastify()

  app.inject({
    method: 'POST',
    url: '/foo/0/1?a=0&b=1',
    headers: {
      a: '0',
      b: '1'
    },
    payload: {
      a: '0',
      b: '1'
    }
  }, (err, response) => {
    app.close()

    t.error(err)
    t.strictEqual(response.statusCode, 200)

    const data = JSON.parse(response.payload)

    t.strictEqual(data.body.a, 0)
    t.strictEqual(data.body.b, undefined)

    t.strictEqual(data.headers.a, 0)
    t.strictEqual(data.headers.b, undefined)

    t.strictEqual(data.params.a, 0)
    t.strictEqual(data.params.b, undefined)

    t.strictEqual(data.query.a, 0)
    t.strictEqual(data.query.b, undefined)
  })
})
