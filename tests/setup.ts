import { vi } from "vitest";

global.on = vi.fn();
global.GetCurrentResourceName = vi.fn(() => "test-resource");
global.IsDuplicityVersion = vi.fn(() => false);
