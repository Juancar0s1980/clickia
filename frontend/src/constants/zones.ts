// Debe coincidir con las zonas sembradas en backend/src/database/seeds y
// las que reconoce backend/src/services/networkStatus.service.ts.
export const ZONES = ["Centro", "Norte", "Sur", "Occidente", "Timbío"] as const;

export type Zone = (typeof ZONES)[number];
