import { describe, it, expect, beforeEach, vi } from "vitest";
import { Profiler, type ProfileStat } from "../src/shared/core/Profiler";

describe("Profiler", () => {
    let profiler: Profiler;

    beforeEach(() => {
        profiler = new Profiler();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("measure", () => {
        it("should measure update time", () => {
            const fn = vi.fn(() => {
                vi.advanceTimersByTime(10);
            });

            profiler.measure("TestSystem", "update", fn);
            expect(fn).toHaveBeenCalledOnce();

            const stats = profiler.getSorted();
            expect(stats.length).toBe(1);
            expect(stats[0]!.name).toBe("TestSystem");
            expect(stats[0]!.updateMs).toBeCloseTo(1);
        });

        it("should measure fixed time", () => {
            const fn = vi.fn(() => {
                vi.advanceTimersByTime(20);
            });

            profiler.measure("TestSystem", "fixed", fn);
            expect(fn).toHaveBeenCalledOnce();

            const stats = profiler.getSorted();
            expect(stats.length).toBe(1);
            expect(stats[0]!.fixedMs).toBeCloseTo(2);
        });

        it("should maintain separate update and fixed timings", () => {
            const updateFn = vi.fn(() => {
                vi.advanceTimersByTime(10);
            });
            const fixedFn = vi.fn(() => {
                vi.advanceTimersByTime(20);
            });

            profiler.measure("System", "update", updateFn);
            profiler.measure("System", "fixed", fixedFn);

            const stats = profiler.getSorted();
            expect(stats[0]!.updateMs).toBeCloseTo(1);
            expect(stats[0]!.fixedMs).toBeCloseTo(2);
        });

        it("should create new stat entry for new system", () => {
            profiler.measure("SystemA", "update", () => {});
            profiler.measure("SystemB", "update", () => {});

            const stats = profiler.getSorted();
            expect(stats.length).toBe(2);
            expect(stats.map((s) => s.name)).toContain("SystemA");
            expect(stats.map((s) => s.name)).toContain("SystemB");
        });

        it("should apply exponential moving average", () => {
            profiler.measure("System", "update", () => {
                vi.advanceTimersByTime(100);
            });

            const first = profiler.getSorted()[0]!.updateMs;

            profiler.measure("System", "update", () => {
                vi.advanceTimersByTime(0);
            });

            const second = profiler.getSorted()[0]!.updateMs;
            expect(second).toBeLessThan(first);
            expect(second).toBeCloseTo(first * 0.9);
        });

        it("should execute provided function", () => {
            const fn = vi.fn();
            profiler.measure("System", "update", fn);
            expect(fn).toHaveBeenCalledOnce();
        });

        it("should preserve function result", () => {
            let result = 0;
            profiler.measure("System", "update", () => {
                result = 42;
            });
            expect(result).toBe(42);
        });
    });

    describe("getSorted", () => {
        it("should return empty array when no measurements", () => {
            const stats = profiler.getSorted();
            expect(stats).toEqual([]);
        });

        it("should return single stat", () => {
            profiler.measure("System", "update", () => {
                vi.advanceTimersByTime(10);
            });

            const stats = profiler.getSorted();
            expect(stats.length).toBe(1);
            expect(stats[0]!.name).toBe("System");
        });

        it("should sort by total time descending", () => {
            profiler.measure("Fast", "update", () => {
                vi.advanceTimersByTime(10);
            });

            profiler.measure("Slow", "update", () => {
                vi.advanceTimersByTime(100);
            });

            profiler.measure("Medium", "update", () => {
                vi.advanceTimersByTime(50);
            });

            const stats = profiler.getSorted();
            expect(stats[0]!.name).toBe("Slow");
            expect(stats[1]!.name).toBe("Medium");
            expect(stats[2]!.name).toBe("Fast");
        });

        it("should combine update and fixed times for sorting", () => {
            profiler.measure("A", "update", () => {
                vi.advanceTimersByTime(50);
            });

            profiler.measure("B", "update", () => {
                vi.advanceTimersByTime(30);
            });
            profiler.measure("B", "fixed", () => {
                vi.advanceTimersByTime(30);
            });

            const stats = profiler.getSorted();
            expect(stats[0]!.name).toBe("B");
        });

        it("should return new array each call", () => {
            profiler.measure("System", "update", () => {});
            const first = profiler.getSorted();
            const second = profiler.getSorted();
            expect(first).not.toBe(second);
        });
    });

    describe("stat structure", () => {
        it("should initialize stats with zero times", () => {
            profiler.measure("System", "update", () => {});
            const stats = profiler.getSorted();
            const stat = stats[0]!;
            expect(stat).toHaveProperty("name");
            expect(stat).toHaveProperty("updateMs");
            expect(stat).toHaveProperty("fixedMs");
        });

        it("should preserve stat reference across measurements", () => {
            profiler.measure("System", "update", () => {});
            const first = profiler.getSorted()[0]!;
            profiler.measure("System", "fixed", () => {});
            const second = profiler.getSorted()[0]!;
            expect(second.name).toBe(first.name);
        });
    });

    describe("edge cases", () => {
        it("should handle zero-time measurements", () => {
            profiler.measure("System", "update", () => {});
            const stats = profiler.getSorted();
            expect(stats[0]!.updateMs).toBeGreaterThanOrEqual(0);
        });

        it("should handle many measurements", () => {
            for (let i = 0; i < 1000; i++) {
                profiler.measure("System", "update", () => {});
            }
            const stats = profiler.getSorted();
            expect(stats.length).toBe(1);
        });

        it("should handle many systems", () => {
            for (let i = 0; i < 100; i++) {
                profiler.measure(`System${i}`, "update", () => {});
            }
            const stats = profiler.getSorted();
            expect(stats.length).toBe(100);
        });
    });
});
