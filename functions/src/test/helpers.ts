import {expect} from "@jest/globals";
import Matchers = jest.Matchers;
import {
  fillroadall,
  UNIT_SECONDS,
  parseDate,
  fuzzyEquals,
  Datapoint,
  Goal,
  GoalVerbose,
} from "../../../src/lib";
import {setLogger} from "react-query";

interface MyMatchers<R> extends Matchers<R> {
  toFuzzyEqual(expected: number): R;
}

expect.extend({
  toFuzzyEqual(received: number, expected: number) {
    const pass = fuzzyEquals(expected, received);
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to fuzzy equal ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to fuzzy equal ${expected}`,
        pass: false,
      };
    }
  },
});

export const e = expect as never as <T>(actual: T) => MyMatchers<T>;

type DatapointInput = Omit<Datapoint, "timestamp"> & { timestamp?: number };
export type GoalInput = Partial<Goal>
  & { datapoints?: DatapointInput[] }

export function makeGoal(g: GoalInput = {}): GoalVerbose {
  const {
    rate,
    slug = "the_slug",
    aggday = "last",
    kyoom = false,
    yaw = 1,
    runits = "d",
    roadall = [],
    fullroad = fillroadall(roadall, UNIT_SECONDS[runits]),
    datapoints = [],
    fineprint = "",
    title = "",
    // eslint-disable-next-line camelcase
    weekends_off = false,
  } = g;

  return {
    rate: rate === undefined ? fullroad[fullroad.length - 1]?.[2] : rate,
    slug,
    aggday,
    kyoom,
    yaw,
    runits,
    roadall,
    fullroad,
    datapoints: datapoints.map((d: DatapointInput) => ({
      timestamp: parseDate(d.daystamp),
      ...d,
    })),
    fineprint,
    title,
    weekends_off,
    mathishard: fullroad[fullroad.length - 1],
  };
}

export async function withMutedReactQueryLogger<T>(
    func: () => Promise<T>
): Promise<T> {
  const noop = () => {
    // do nothing
  };

  setLogger({
    log: noop,
    warn: noop,
    error: noop,
  });

  const result = await func();

  setLogger(window.console);

  return result;
}
