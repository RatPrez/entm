import type { EntityComponent } from "../EntityComponent";

export interface Vehicle extends EntityComponent {
    readonly sType: "vehicle";
    speed: number;
    gear:  number;
    rpm:   number;
}

export const createVehicle = (data: Omit<Vehicle, "sType">): Vehicle => ({ sType: "vehicle", ...data });
