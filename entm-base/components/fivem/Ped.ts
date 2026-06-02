import type { EntityComponent } from "../EntityComponent";

export interface Ped extends EntityComponent {
    readonly sType: "ped";
    health: number;
    armour: number;
}

export const createPed = (data: Omit<Ped, "sType">): Ped => ({ sType: "ped", ...data });
