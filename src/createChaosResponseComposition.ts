import { context, createResponseComposition } from "msw";

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const percent = (percent: number) => random(0, 100) <= percent;

type HttpStatus = number;

type Error = {
  status: HttpStatus;
  body?: string;
  delay?: number;
  rate?: number;
};

const defaultErrors: Error[] = [
  {
    status: 429,
    body: "Too Many Requests",
    delay: 100,
    rate: 0.1,
  },
  {
    status: 500,
    body: "Internal Server Error",
    delay: 300,
    rate: 5,
  },
  {
    status: 502,
    body: "Bad Gateway",
    delay: 300,
    rate: 5,
  },
  {
    status: 503,
    body: "Service Unavailable",
    delay: 300,
    rate: 3,
  },
  {
    status: 504,
    body: "Gateway Timeout",
    delay: 3000,
    rate: 10,
  },
];

const DEFAULT_ERROR_RATE = 10;

export const createChaosResponse = (errors: Error[] = defaultErrors) => {
  return createResponseComposition(undefined, [
    (res) => {
      for (const error of errors) {
        const {
          rate = DEFAULT_ERROR_RATE,
          body = "Error caused by chaos msw composition",
        } = error;
        if (percent(rate)) {
          return { ...res, ...error, body };
        }
      }

      return res;
    },
    context.delay(),
  ]);
};
