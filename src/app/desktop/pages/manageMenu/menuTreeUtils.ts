import type { IMenuAdminNode } from "../../../../store/menuSlide";

/** Must match MenuController.MaxDepth on the backend. */
export const MAX_MENU_DEPTH = 3;

export interface FlatRow {
  node: IMenuAdminNode;
  depth: number;
}

export const flattenTree = (nodes: IMenuAdminNode[], depth = 0): FlatRow[] =>
  nodes.flatMap((node) => [{ node, depth }, ...flattenTree(node.children, depth + 1)]);

export const collectDescendantIds = (node: IMenuAdminNode): Set<number> => {
  const ids = new Set<number>([node.menuId]);
  const walk = (n: IMenuAdminNode) => n.children.forEach((c) => { ids.add(c.menuId); walk(c); });
  walk(node);
  return ids;
};
