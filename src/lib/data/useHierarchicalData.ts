import { useMemo } from 'react'

export type Node<T> = T & {
  children?: Set<Node<T>>
}

/**
 * Transforms map into tree.
 *
 * Beware that this mutates the input map!
 */
export function useHierarchicalData<T>(
  map: Record<string, T> | undefined,
  getParentId: (entity: T) => number | null,
): Array<Node<T>> {
  return useMemo(() => createTree(map, getParentId), [map, getParentId])
}

function createTree<T>(
  map: Record<string, T> | undefined,
  getParentId: (item: T) => number | null,
) {
  const roots: Array<Node<T>> = []

  if (map === undefined) return roots

  Object.values(map).forEach((item) => {
    const parentId = getParentId(item)
    if (parentId == null) {
      roots.push(item)
    } else {
      const parent = map[parentId] as Node<T> | undefined
      if (parent !== undefined) {
        if (parent.children === undefined) {
          parent.children = new Set()
        }
        parent.children.add(item)
      }
    }
  })

  return roots
}
