import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { CategoryType } from "../service-categories.types";

/**
 * Feature: service-category-management
 * Property 1: Types array JSON round-trip
 *
 * Validates: Requirements 7.6
 */

const VALID_CATEGORY_TYPES: CategoryType[] = [
  "general",
  "daily",
  "monthly",
  "popular",
];

/** Arbitrary that generates a subset of valid CategoryType values (including empty array) */
const categoryTypesArrayArb: fc.Arbitrary<CategoryType[]> = fc.subarray(
  VALID_CATEGORY_TYPES,
  { minLength: 0, maxLength: VALID_CATEGORY_TYPES.length }
);

describe("Feature: service-category-management, Property 1: Types array JSON round-trip", () => {
  it("serializing a valid CategoryType[] to JSON and back produces a deeply equal array", () => {
    fc.assert(
      fc.property(categoryTypesArrayArb, (types) => {
        const serialized = JSON.stringify(types);
        const deserialized = JSON.parse(serialized);
        expect(deserialized).toEqual(types);
      }),
      { numRuns: 100 }
    );
  });
});
