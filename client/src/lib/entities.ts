import type { LinkProps } from '@tanstack/react-router';
import type React from 'react';

export interface MenuRouteBaseItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
}

export type LinkItem = MenuRouteBaseItem & {
  url: LinkProps['to'];
  items?: never;
};

export type CollapsibleItem = MenuRouteBaseItem & {
  items: (MenuRouteBaseItem & { url: LinkProps['to'] })[];
  url?: LinkProps['to'];
};

export type MenuItem = CollapsibleItem | LinkItem;

export type MenuGroupItem = {
  title: string;
  items: MenuItem[];
};

export type MenuRoute = MenuGroupItem[];

interface Base {
  id: string;
  createdAt: string;
  updatedAt: string;
  trashed: boolean;
  trashedAt: string | null;
}

export interface Meta {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  firstPage: number;
}
export interface Paginated<Entity> {
  data: Entity[];
  meta: Meta;
}

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Category extends Base {
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
}

export interface Product extends Base {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
}
