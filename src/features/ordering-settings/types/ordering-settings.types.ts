export interface OrderingLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface OrderingConfiguration {
  orderingLocation: OrderingLocation | null;
  orderingRadiusMeters: number;
  orderingEnabled: boolean;
}
