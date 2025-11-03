import type { LinkProps } from "@tanstack/react-router";

export interface MenuRouteBaseItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
}

export type LinkItem = MenuRouteBaseItem & {
  url: LinkProps["to"];
  items?: never;
};

export type CollapsibleItem = MenuRouteBaseItem & {
  items: (MenuRouteBaseItem & { url: LinkProps["to"] })[];
  url?: LinkProps["to"];
};

export type MenuItem = CollapsibleItem | LinkItem;

export type MenuGroupItem = {
  title: string;
  items: MenuItem[];
};

export type MenuRoute = MenuGroupItem[];

export interface Meta {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  firstPage: number;
}
export interface Paginated<Entity> {
  data: Entity;
  meta: Meta;
}

export enum CategoryStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  created_at: string;
  updated_at: string;
}
