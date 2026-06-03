import { describe, it, expect, beforeEach } from "vitest";
import { Transform } from "../src/shared/components/Transform";
import { vec3 } from "../src/shared/math/Vec3";

describe("Transform component", () => {
    describe("construction", () => {
        it("should construct with position, rotation, scale", () => {
            const transform = new Transform({
                position: vec3(1, 2, 3),
                rotation: vec3(0, 90, 0),
                scale: vec3(1, 1, 1)
            });

            expect(transform.position).toEqual({ x: 1, y: 2, z: 3 });
            expect(transform.rotation).toEqual({ x: 0, y: 90, z: 0 });
            expect(transform.scale).toEqual({ x: 1, y: 1, z: 1 });
        });

        it("should have correct sType", () => {
            const transform = new Transform({
                position: vec3(),
                rotation: vec3(),
                scale: vec3(1, 1, 1)
            });
            expect(transform.sType).toBe("transform");
        });
    });

    describe("properties", () => {
        it("should allow position modification", () => {
            const transform = new Transform({
                position: vec3(0, 0, 0),
                rotation: vec3(),
                scale: vec3(1, 1, 1)
            });

            transform.position = vec3(10, 20, 30);
            expect(transform.position).toEqual({ x: 10, y: 20, z: 30 });
        });

        it("should allow rotation modification", () => {
            const transform = new Transform({
                position: vec3(),
                rotation: vec3(0, 0, 0),
                scale: vec3(1, 1, 1)
            });

            transform.rotation = vec3(45, 90, 180);
            expect(transform.rotation).toEqual({ x: 45, y: 90, z: 180 });
        });

        it("should allow scale modification", () => {
            const transform = new Transform({
                position: vec3(),
                rotation: vec3(),
                scale: vec3(1, 1, 1)
            });

            transform.scale = vec3(2, 3, 4);
            expect(transform.scale).toEqual({ x: 2, y: 3, z: 4 });
        });
    });

    describe("integration with ECS", () => {
        it("should be usable as component", () => {
            const transform = new Transform({
                position: vec3(1, 2, 3),
                rotation: vec3(),
                scale: vec3(1, 1, 1)
            });

            expect(transform).toBeInstanceOf(Transform);
            expect(typeof transform.sType).toBe("string");
        });
    });
});
