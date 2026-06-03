import { describe, it, expect } from "vitest";
import { vec3, vec3Add, vec3Sub, vec3Scale, vec3Len, type Vec3 } from "../src/shared/math/Vec3";

describe("Vec3", () => {
    describe("vec3 constructor", () => {
        it("should create from x, y, z", () => {
            const v = vec3(1, 2, 3);
            expect(v.x).toBe(1);
            expect(v.y).toBe(2);
            expect(v.z).toBe(3);
        });

        it("should create from array", () => {
            const v = vec3([4, 5, 6]);
            expect(v.x).toBe(4);
            expect(v.y).toBe(5);
            expect(v.z).toBe(6);
        });

        it("should default to zero", () => {
            const v = vec3();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
            expect(v.z).toBe(0);
        });

        it("should handle partial array", () => {
            const v1 = vec3([1]);
            expect(v1).toEqual({ x: 1, y: 0, z: 0 });

            const v2 = vec3([1, 2]);
            expect(v2).toEqual({ x: 1, y: 2, z: 0 });
        });

        it("should handle empty array", () => {
            const v = vec3([]);
            expect(v).toEqual({ x: 0, y: 0, z: 0 });
        });

        it("should handle partial parameters", () => {
            const v1 = vec3(1);
            expect(v1).toEqual({ x: 1, y: 0, z: 0 });

            const v2 = vec3(1, 2);
            expect(v2).toEqual({ x: 1, y: 2, z: 0 });
        });
    });

    describe("vec3Add", () => {
        it("should add two vectors", () => {
            const a = vec3(1, 2, 3);
            const b = vec3(4, 5, 6);
            const result = vec3Add(a, b);
            expect(result).toEqual({ x: 5, y: 7, z: 9 });
        });

        it("should handle zero vector", () => {
            const a = vec3(1, 2, 3);
            const zero = vec3(0, 0, 0);
            const result = vec3Add(a, zero);
            expect(result).toEqual(a);
        });

        it("should handle negative values", () => {
            const a = vec3(1, 2, 3);
            const b = vec3(-1, -2, -3);
            const result = vec3Add(a, b);
            expect(result).toEqual({ x: 0, y: 0, z: 0 });
        });
    });

    describe("vec3Sub", () => {
        it("should subtract two vectors", () => {
            const a = vec3(5, 7, 9);
            const b = vec3(1, 2, 3);
            const result = vec3Sub(a, b);
            expect(result).toEqual({ x: 4, y: 5, z: 6 });
        });

        it("should handle zero vector", () => {
            const a = vec3(1, 2, 3);
            const zero = vec3(0, 0, 0);
            const result = vec3Sub(a, zero);
            expect(result).toEqual(a);
        });

        it("should handle identical vectors", () => {
            const a = vec3(5, 5, 5);
            const result = vec3Sub(a, a);
            expect(result).toEqual({ x: 0, y: 0, z: 0 });
        });

        it("should handle negative results", () => {
            const a = vec3(1, 2, 3);
            const b = vec3(4, 5, 6);
            const result = vec3Sub(a, b);
            expect(result).toEqual({ x: -3, y: -3, z: -3 });
        });
    });

    describe("vec3Scale", () => {
        it("should scale vector by scalar", () => {
            const v = vec3(1, 2, 3);
            const result = vec3Scale(v, 2);
            expect(result).toEqual({ x: 2, y: 4, z: 6 });
        });

        it("should handle zero scale", () => {
            const v = vec3(1, 2, 3);
            const result = vec3Scale(v, 0);
            expect(result).toEqual({ x: 0, y: 0, z: 0 });
        });

        it("should handle negative scale", () => {
            const v = vec3(1, 2, 3);
            const result = vec3Scale(v, -1);
            expect(result).toEqual({ x: -1, y: -2, z: -3 });
        });

        it("should handle fractional scale", () => {
            const v = vec3(10, 20, 30);
            const result = vec3Scale(v, 0.5);
            expect(result).toEqual({ x: 5, y: 10, z: 15 });
        });
    });

    describe("vec3Len", () => {
        it("should compute length of unit vectors", () => {
            expect(vec3Len(vec3(1, 0, 0))).toBeCloseTo(1);
            expect(vec3Len(vec3(0, 1, 0))).toBeCloseTo(1);
            expect(vec3Len(vec3(0, 0, 1))).toBeCloseTo(1);
        });

        it("should compute length of zero vector", () => {
            expect(vec3Len(vec3(0, 0, 0))).toBe(0);
        });

        it("should compute length of arbitrary vector", () => {
            const v = vec3(3, 4, 0);
            expect(vec3Len(v)).toBeCloseTo(5);
        });

        it("should compute length of 3D vector", () => {
            const v = vec3(1, 2, 2);
            expect(vec3Len(v)).toBeCloseTo(3);
        });

        it("should handle negative components", () => {
            const v1 = vec3(-3, -4, 0);
            const v2 = vec3(3, 4, 0);
            expect(vec3Len(v1)).toBeCloseTo(vec3Len(v2));
        });
    });

    describe("combined operations", () => {
        it("should support chained operations", () => {
            const a = vec3(1, 2, 3);
            const b = vec3(4, 5, 6);
            const sum = vec3Add(a, b);
            const scaled = vec3Scale(sum, 2);
            expect(scaled).toEqual({ x: 10, y: 14, z: 18 });
        });

        it("should maintain vector properties", () => {
            const a = vec3(1, 0, 0);
            const b = vec3(0, 1, 0);
            const sum = vec3Add(a, b);
            const len = vec3Len(sum);
            expect(len).toBeCloseTo(Math.sqrt(2));
        });
    });
});
