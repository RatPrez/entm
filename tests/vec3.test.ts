import { describe, it, expect } from "vitest";
import { Vec3 } from "../src/shared/math/Vec3";

describe("Vec3", () => {
    describe("vec3 constructor", () => {
        it("should create from x, y, z", () => {
            const v = new Vec3(1, 2, 3);
            expect(v.x).toBe(1);
            expect(v.y).toBe(2);
            expect(v.z).toBe(3);
        });

        it("should create from array", () => {
            const v = Vec3.fromArray([4, 5, 6]);
            expect(v.x).toBe(4);
            expect(v.y).toBe(5);
            expect(v.z).toBe(6);
        });

        it("should default to zero", () => {
            const v = Vec3.zero();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
            expect(v.z).toBe(0);
        });

        it("should handle partial array", () => {
            const v1 = Vec3.fromArray([1]);
            expect(v1).toEqual({ x: 1, y: 0, z: 0 });

            const v2 = Vec3.fromArray([1, 2]);
            expect(v2).toEqual({ x: 1, y: 2, z: 0 });
        });

        it("should handle empty array", () => {
            const v = Vec3.fromArray([]);
            expect(v).toEqual({ x: 0, y: 0, z: 0 });
        });

        it("should handle partial parameters", () => {
            const v1 = new Vec3(1);
            expect(v1).toEqual({ x: 1, y: 0, z: 0 });

            const v2 = new Vec3(1, 2);
            expect(v2).toEqual({ x: 1, y: 2, z: 0 });
        });
    });

    describe("vec3Add", () => {
        it("should add two vectors", () => {
            const a = new Vec3(1, 2, 3);
            const b = new Vec3(4, 5, 6);
            const result = a.add(b);
            expect(result).toEqual({ x: 5, y: 7, z: 9 });
        });

        it("should handle zero vector", () => {
            const a = new Vec3(1, 2, 3);
            const zero = Vec3.zero();
            const result = a.add(zero);
            expect(result).toEqual(a);
        });

        it("should handle negative values", () => {
            const a = new Vec3(1, 2, 3);
            const b = new Vec3(-1, -2, -3);
            const result = a.add(b);
            expect(result).toEqual({ x: 0, y: 0, z: 0 });
        });
    });

    describe("vec3Sub", () => {
        it("should subtract two vectors", () => {
            const a = new Vec3(5, 7, 9);
            const b = new Vec3(1, 2, 3);
            const result = a.sub(b);
            expect(result).toEqual({ x: 4, y: 5, z: 6 });
        });

        it("should handle zero vector", () => {
            const a = new Vec3(1, 2, 3);
            const zero = Vec3.zero();
            const result = a.sub(zero);
            expect(result).toEqual(a);
        });

        it("should handle identical vectors", () => {
            const a = new Vec3(5, 5, 5);
            const result = a.sub(a);
            expect(result).toEqual({ x: 0, y: 0, z: 0 });
        });

        it("should handle negative results", () => {
            const a = new Vec3(1, 2, 3);
            const b = new Vec3(4, 5, 6);
            const result = a.sub(b);
            expect(result).toEqual({ x: -3, y: -3, z: -3 });
        });
    });

    describe("vec3Scale", () => {
        it("should scale vector by scalar", () => {
            const v = new Vec3(1, 2, 3);
            const result = v.scale(2);
            expect(result).toEqual({ x: 2, y: 4, z: 6 });
        });

        it("should handle zero scale", () => {
            const v = new Vec3(1, 2, 3);
            const result = v.scale(0);
            expect(result).toEqual({ x: 0, y: 0, z: 0 });
        });

        it("should handle negative scale", () => {
            const v = new Vec3(1, 2, 3);
            const result = v.scale(-1);
            expect(result).toEqual({ x: -1, y: -2, z: -3 });
        });

        it("should handle fractional scale", () => {
            const v = new Vec3(10, 20, 30);
            const result = v.scale(0.5);
            expect(result).toEqual({ x: 5, y: 10, z: 15 });
        });
    });

    describe("vec3Len", () => {
        it("should compute length of unit vectors", () => {
            expect(new Vec3(1, 0, 0).length()).toBeCloseTo(1);
            expect(new Vec3(0, 1, 0).length()).toBeCloseTo(1);
            expect(new Vec3(0, 0, 1).length()).toBeCloseTo(1);
        });

        it("should compute length of zero vector", () => {
            expect(new Vec3(0, 0, 0).length()).toBe(0);
        });

        it("should compute length of arbitrary vector", () => {
            const v = new Vec3(3, 4, 0);
            expect(v.length()).toBeCloseTo(5);
        });

        it("should compute length of 3D vector", () => {
            const v = new Vec3(1, 2, 2);
            expect(v.length()).toBeCloseTo(3);
        });

        it("should handle negative components", () => {
            const v1 = new Vec3(-3, -4, 0);
            const v2 = new Vec3(3, 4, 0);
            expect(v1.length()).toBeCloseTo(v2.length());
        });
    });

    describe("combined operations", () => {
        it("should support chained operations", () => {
            const a = new Vec3(1, 2, 3);
            const b = new Vec3(4, 5, 6);
            const sum = a.add(b);
            const scaled = sum.scale(2);
            expect(scaled).toEqual({ x: 10, y: 14, z: 18 });
        });

        it("should maintain vector properties", () => {
            const a = new Vec3(1, 0, 0);
            const b = new Vec3(0, 1, 0);
            const sum = a.add(b);
            const len = sum.length();
            expect(len).toBeCloseTo(Math.sqrt(2));
        });
    });
});
