export interface Paginated<Entity> {
  data: Entity[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
  };
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
}
