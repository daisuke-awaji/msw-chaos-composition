# msw-chaos-composition

<p align="center">
  <img src="media/msw-chaos-composition.png" width="150" alt="Chaos Mock Service Worker logo" />
</p>

<p align="center">msw-chaos-composition add chaos into the response of msw.</p>

## Features

- Randomize Mock Service Worker Response

## Usage

### Basic msw usage

```ts
const handler = rest.get("/hello", (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      message: "hello world",
    })
  );
});
const server = setupServer(handler);
server.listen();
```

fetch `/hello` then response is `{ status: 200, body: { message: "hello world" } }`

### Using mws-chaos-composition

Use `chaosRes()` created by `createChaosResponse()`

```ts
const chaosRes = createChaosResponse();
const handler = rest.get("/hello", (req, res, ctx) => {
  return chaosRes(
    ctx.status(200),
    ctx.json({
      message: "hello world",
    })
  );
});
const server = setupServer(handler);
server.listen();
```

fetch `/hello` then one of the following will be returned as a response.

- `{ status: 429, body: "Too Many Requests", }`
- `{ status: 500, body: "Internal Server Error" }`
- `{ status: 502, body: "Bad Gateway" }`
- `{ status: 503, body: "Service Unavailable" }`
- `{ status: 504, body: "Gateway Timeout" }`

## Params

Specify the response that will result in an error

```ts
const errors = [
  {
    status: 500,
    body: "Internal Server Error",
    delay: 500,
    rate: 10,
  },
  {
    status: 504,
    body: "Gateway Timeout",
    delay: 100000,
    rate: 20,
  },
];
const chaosRes = createChaosResponse();
const handler = rest.get("/hello", (req, res, ctx) => {
  return chaosRes(
    ctx.status(200),
    ctx.json({
      message: "hello world",
    })
  );
});
const server = setupServer(handler);
server.listen();
```

fetch `/hello` then one of the following will be returned as a response.

- `{ status: 500, body: "Internal Server Error" }`
- `{ status: 504, body: "Gateway Timeout" }`
