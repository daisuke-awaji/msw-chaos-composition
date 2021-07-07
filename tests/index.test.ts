import { setupServer } from "msw/node";
import { rest } from "msw";
import axios from "axios";
import { createChaosResponse } from "../src/index";

const MOCK_API_ENDPOINT = "https://mock.example.com/mock";

describe("msw-chaos-composition", () => {
  test("handle default msw", async () => {
    const server = setupServer(
      rest.get(MOCK_API_ENDPOINT, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            message: "hello world",
          })
        );
      })
    );

    server.listen();
    const result = await axios.get(MOCK_API_ENDPOINT);
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({
      message: "hello world",
    });
    server.close();
  });

  test("handle 429 error by msw-chaos-composition", async () => {
    const errors = [
      {
        status: 429,
        body: "Too Many Requests",
        delay: 100,
        rate: 100, // 100%
      },
    ];
    const chaosRes = createChaosResponse(errors);
    const server = setupServer(
      rest.get(MOCK_API_ENDPOINT, (req, res, ctx) => {
        return chaosRes(
          ctx.status(200),
          ctx.json({
            message: "hello world",
          })
        );
      })
    );

    server.listen();

    await expect(axios.get(MOCK_API_ENDPOINT)).rejects.toThrowError(
      "Request failed with status code 429"
    );
    server.close();
  });

  test("handle 500 error by msw-chaos-composition", async () => {
    const errors = [
      {
        status: 500,
        body: "Internal Server Error",
        delay: 500,
        rate: 100, // 100%
      },
    ];
    const chaosRes = createChaosResponse(errors);
    const server = setupServer(
      rest.get(MOCK_API_ENDPOINT, (req, res, ctx) => {
        return chaosRes(
          ctx.status(200),
          ctx.json({
            message: "hello world",
          })
        );
      })
    );

    server.listen();

    try {
      await axios.get(MOCK_API_ENDPOINT);
    } catch (e) {
      expect(e.response).toMatchObject({
        status: 500,
        data: "Internal Server Error",
      });
    }

    server.close();
  });
  test("handle 504 error by msw-chaos-composition", async () => {
    const errors = [
      {
        status: 504,
        body: "Gateway Timeout",
        delay: 100,
        rate: 100, // 100%
      },
    ];
    const chaosRes = createChaosResponse(errors);
    const server = setupServer(
      rest.get(MOCK_API_ENDPOINT, (req, res, ctx) => {
        return chaosRes(
          ctx.status(200),
          ctx.json({
            message: "hello world",
          })
        );
      })
    );

    server.listen();

    try {
      await axios.get(MOCK_API_ENDPOINT);
    } catch (e) {
      expect(e.response).toMatchObject({
        status: 504,
        data: "Gateway Timeout",
      });
    }
    server.close();
  });

  test("optional parameter", async () => {
    const errors = [
      {
        status: 504,
        rate: 100,
      },
    ];
    const chaosRes = createChaosResponse(errors);
    const server = setupServer(
      rest.get(MOCK_API_ENDPOINT, (req, res, ctx) => {
        return chaosRes(
          ctx.status(200),
          ctx.json({
            message: "hello world",
          })
        );
      })
    );

    server.listen();

    try {
      await axios.get(MOCK_API_ENDPOINT);
    } catch (e) {
      expect(e.response).toMatchObject({
        status: 504,
        data: "Error caused by chaos msw composition",
      });
    }
    server.close();
  });
});
