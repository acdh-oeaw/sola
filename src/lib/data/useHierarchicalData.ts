import { useMemo } from 'react'

export type Node<T> = T & {
  children: Set<Node<T>>
}

/**
 * Transforms map into tree.
 */
export function useHierarchicalData<T>(
  map: Record<string, T> | undefined,
  getParentId: (entity: T) => number | null,
): Array<Node<T>> {
  return useMemo(() => {
    return createTree(map, getParentId)
  }, [map, getParentId])
}

function createTree<T>(
  map: Record<string, T> | undefined,
  getParentId: (item: T) => number | null,
) {
  const roots: Array<Node<T>> = []

  if (map === undefined) return roots

  /** Clone items, because they will be mutated. */
  const items = Object.entries(map).reduce<Record<string, Node<T>>>((acc, [id, item]) => {
    acc[id] = {
      ...item,
      children: new Set<Node<T>>(),
    }
    return acc
  }, {})

  Object.values(items).forEach((item) => {
    const parentId = getParentId(item)
    if (parentId == null) {
      roots.push(item)
    } else {
      const parent = items[parentId]
      if (parent !== undefined) {
        parent.children.add(item)
      }
    }
  })

  return roots
}
