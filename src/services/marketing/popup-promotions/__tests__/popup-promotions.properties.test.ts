import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type {
  ITriggerConfig,
  ITargetConfig,
  TriggerType,
  MetadataOperator,
} from "../popup-promotions.types";

const TRIGGER_TYPES: TriggerType[] = [
  "immediate",
  "delay",
  "scroll_depth",
  "exit_intent",
  "session_count",
  "inactivity",
  "event",
];
const OPERATORS: MetadataOperator[] = [
  "equals",
  "not_equals",
  "in",
  "contains",
  "exists",
];

const triggerConfigArb: fc.Arbitrary<ITriggerConfig> = fc.record({
  rules: fc.array(
    fc.record({
      type: fc.constantFrom(...TRIGGER_TYPES),
      delay_seconds: fc.option(fc.nat({ max: 300 }), { nil: undefined }),
      scroll_percent: fc.option(fc.integer({ min: 0, max: 100 }), {
        nil: undefined,
      }),
      event_key: fc.option(fc.stringMatching(/^[a-z][a-z0-9_]{2,20}$/), {
        nil: undefined,
      }),
      metadata_conditions: fc.option(
        fc.array(
          fc.record({
            field: fc.stringMatching(/^[a-z_]{1,20}$/),
            operator: fc.constantFrom(...OPERATORS),
            value: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
          }),
          { minLength: 0, maxLength: 3 }
        ),
        { nil: undefined }
      ),
    }),
    { minLength: 1, maxLength: 4 }
  ),
  combine: fc.constant("and" as const),
});

const targetConfigArb: fc.Arbitrary<ITargetConfig> = fc.record({
  user_types: fc.option(fc.subarray(["client", "mitra"]), { nil: undefined }),
  journey_stages: fc.option(
    fc.subarray(["registered", "verified", "funded", "active"]),
    { nil: undefined }
  ),
  platforms: fc.option(fc.subarray(["android", "ios"]), { nil: undefined }),
  segment_ids: fc.option(
    fc.array(fc.nat({ max: 100 }), { minLength: 0, maxLength: 5 }),
    { nil: undefined }
  ),
});

describe("Feature: popup-promotion, Property 1: trigger_config JSON round-trip", () => {
  it("serializing trigger_config to JSON and back produces equal object", () => {
    fc.assert(
      fc.property(triggerConfigArb, (config) => {
        const serialized = JSON.stringify(config);
        const deserialized = JSON.parse(serialized);
        expect(deserialized).toEqual(config);
      }),
      { numRuns: 50 }
    );
  });
});

describe("Feature: popup-promotion, Property 2: target_config JSON round-trip", () => {
  it("serializing target_config to JSON and back produces equal object", () => {
    fc.assert(
      fc.property(targetConfigArb, (config) => {
        const serialized = JSON.stringify(config);
        const deserialized = JSON.parse(serialized);
        expect(deserialized).toEqual(config);
      }),
      { numRuns: 50 }
    );
  });
});
