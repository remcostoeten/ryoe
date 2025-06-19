import { useOptimistic, useState, useCallback, useMemo } from 'react'
import type { TEntity, TOptimisticAction, TCrudConfig, TMutationHandlers } from '@/factories/crud-types'

function createOptimisticReducer<T extends TEntity>() {
  return function optimisticReducer(
    state: TOptimisticAction<T>[],
    action: TOptimisticAction<T>
  ): TOptimisticAction<T>[] {
    return [...state, action]
  }
}

function createEntityManipulator<T extends TEntity>() {
  const addEntity = (entities: T[], entity: T, parentId?: number | string): T[] => {
    if (!parentId) {
      return [...entities, entity]
    }

    return entities.map(item => {
      if ('children' in item && item.id === parentId) {
        return {
          ...item,
          children: [...((item as any).children || []), entity]
        } as T
      }
      if ('children' in item && (item as any).children) {
        return {
          ...item,
          children: addEntity((item as any).children, entity, parentId)
        } as T
      }
      return item
    })
  }

  const removeEntity = (entities: T[], id: number | string): T[] => {
    return entities
      .filter(item => item.id !== id)
      .map(item => {
        if ('children' in item && (item as any).children) {
          return {
            ...item,
            children: removeEntity((item as any).children, id)
          } as T
        }
        return item
      })
  }

  const updateEntity = (entities: T[], id: number | string, updates: Partial<T>): T[] => {
    return entities.map(item => {
      if (item.id === id) {
        return { ...item, ...updates, updatedAt: new Date() }
      }
      if ('children' in item && (item as any).children) {
        return {
          ...item,
          children: updateEntity((item as any).children, id, updates)
        } as T
      }
      return item
    })
  }

  const moveEntity = (
    entities: T[],
    entityId: number | string,
    targetId: number | string,
    position = 0
  ): T[] => {
    const entity = findEntity(entities, entityId)
    if (!entity) return entities

    const withoutEntity = removeEntity(entities, entityId)
    const updatedEntity = { ...entity, updatedAt: new Date() }

    return addEntity(withoutEntity, updatedEntity, targetId)
  }

  const findEntity = (entities: T[], id: number | string): T | null => {
    for (const entity of entities) {
      if (entity.id === id) return entity
      if ('children' in entity && (entity as any).children) {
        const found = findEntity((entity as any).children, id)
        if (found) return found
      }
    }
    return null
  }

  return {
    addEntity,
    removeEntity,
    updateEntity,
    moveEntity,
    findEntity
  }
}

function createCrudOperations<T extends TEntity>(
  config: TCrudConfig<T>,
  mutations: TMutationHandlers<T>
) {
  const { addEntity, removeEntity, updateEntity, moveEntity, findEntity } = createEntityManipulator<T>()
  const optimisticReducer = createOptimisticReducer<T>()

  function useCrudOperations(
    entities: T[],
    onEntitiesChange: (entities: T[]) => void
  ) {
    const [optimisticActions, addOptimisticAction] = useOptimistic<
      TOptimisticAction<T>[],
      TOptimisticAction<T>
    >([], optimisticReducer)

    const [editingId, setEditingId] = useState<number | string | null>(null)
    const [editingValue, setEditingValue] = useState("")

    const processedEntities = useMemo(() => {
      let result = [...entities]

      optimisticActions.forEach(action => {
        switch (action.type) {
          case 'CREATE':
            result = addEntity(result, action.entity)
            break
          case 'UPDATE':
            if (action.updates) {
              result = updateEntity(result, action.entity.id, action.updates)
            }
            break
          case 'DELETE':
            result = removeEntity(result, action.entity.id)
            break
          case 'MOVE':
            if (action.targetId !== undefined) {
              result = moveEntity(result, action.entity.id, action.targetId, action.position)
            }
            break
        }
      })

      return result
    }, [entities, optimisticActions])

    const handleCreate = useCallback(async (
      data?: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>,
      parentId?: number | string
    ) => {
      const tempId = `${config.tempIdPrefix}-${Date.now()}`
      const now = new Date()

      const tempEntity = {
        ...config.defaultValues,
        ...data,
        id: tempId,
        createdAt: now,
        updatedAt: now,
        isTemp: true
      } as T

      addOptimisticAction({
        type: 'CREATE',
        entity: tempEntity,
        tempId
      })

      const newEntities = addEntity(processedEntities, tempEntity, parentId)
      onEntitiesChange(newEntities)

      try {
        const created = await mutations.create({
          ...config.defaultValues,
          ...data
        })

        const finalEntities = removeEntity(processedEntities, tempId)
        const withRealEntity = addEntity(finalEntities, created, parentId)
        onEntitiesChange(withRealEntity)

        config.onSuccess?.('create', created)
        return created
      } catch (error) {
        const revertedEntities = removeEntity(processedEntities, tempId)
        onEntitiesChange(revertedEntities)
        config.onError?.('create', error as Error, tempEntity)
        throw error
      }
    }, [addOptimisticAction, processedEntities, onEntitiesChange])

    const handleUpdate = useCallback(async (
      id: number | string,
      updates: Partial<T>
    ) => {
      const entity = findEntity(processedEntities, id)
      if (!entity) return

      if (config.validationRules && !config.validationRules({ ...entity, ...updates })) {
        return
      }

      addOptimisticAction({
        type: 'UPDATE',
        entity,
        updates
      })

      const optimisticEntities = updateEntity(processedEntities, id, updates)
      onEntitiesChange(optimisticEntities)

      try {
        const updated = await mutations.update(id, updates)

        const finalEntities = updateEntity(processedEntities, id, updated)
        onEntitiesChange(finalEntities)

        config.onSuccess?.('update', updated)
        return updated
      } catch (error) {
        const revertedEntities = updateEntity(processedEntities, id, entity)
        onEntitiesChange(revertedEntities)
        config.onError?.('update', error as Error, entity)
        throw error
      }
    }, [addOptimisticAction, processedEntities, onEntitiesChange])

    const handleDelete = useCallback(async (id: number | string) => {
      const entity = findEntity(processedEntities, id)
      if (!entity) return

      addOptimisticAction({
        type: 'DELETE',
        entity
      })

      const optimisticEntities = removeEntity(processedEntities, id)
      onEntitiesChange(optimisticEntities)

      try {
        await mutations.delete(id)
        config.onSuccess?.('delete', entity)
      } catch (error) {
        const revertedEntities = addEntity(processedEntities, entity)
        onEntitiesChange(revertedEntities)
        config.onError?.('delete', error as Error, entity)
        throw error
      }
    }, [addOptimisticAction, processedEntities, onEntitiesChange])

    const handleMove = useCallback(async (
      id: number | string,
      targetId: number | string,
      position = 0
    ) => {
      if (!mutations.move) return

      const entity = findEntity(processedEntities, id)
      if (!entity) return

      addOptimisticAction({
        type: 'MOVE',
        entity,
        targetId,
        position
      })

      const optimisticEntities = moveEntity(processedEntities, id, targetId, position)
      onEntitiesChange(optimisticEntities)

      try {
        const moved = await mutations.move(id, targetId, position)
        config.onSuccess?.('move', moved)
        return moved
      } catch (error) {
        onEntitiesChange(processedEntities)
        config.onError?.('move', error as Error, entity)
        throw error
      }
    }, [addOptimisticAction, processedEntities, onEntitiesChange])

    const startEditing = useCallback((id: number | string, currentValue = "") => {
      setEditingId(id)
      setEditingValue(currentValue)
    }, [])

    const cancelEditing = useCallback(() => {
      setEditingId(null)
      setEditingValue("")
    }, [])

    const commitEdit = useCallback(async (id: number | string, field: keyof T) => {
      const trimmedValue = editingValue.trim()
      if (!trimmedValue) return

      await handleUpdate(id, { [field]: trimmedValue } as Partial<T>)
      cancelEditing()
    }, [editingValue, handleUpdate, cancelEditing])

    return {
      entities: processedEntities,
      isEditing: (id: number | string) => editingId === id,
      editingValue,
      setEditingValue,
      handleCreate,
      handleUpdate,
      handleDelete,
      handleMove,
      startEditing,
      cancelEditing,
      commitEdit,
      findEntity: (id: number | string) => findEntity(processedEntities, id)
    }
  }

  return useCrudOperations
}

function createHierarchicalCrud<T extends TEntity & { parentId?: number | string | null }>(
  config: TCrudConfig<T>,
  mutations: TMutationHandlers<T>
) {
  const baseCrud = createCrudOperations(config, mutations)

  return function useHierarchicalCrud(
    entities: T[],
    onEntitiesChange: (entities: T[]) => void
  ) {
    const base = baseCrud(entities, onEntitiesChange)

    const createChild = useCallback(async (
      parentId: number | string,
      data?: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'parentId'>>
    ) => {
      return base.handleCreate({ ...data, parentId }, parentId)
    }, [base.handleCreate])

    const getAllChildren = useCallback((parentId: number | string): T[] => {
      const collectChildren = (entities: T[], targetParentId: number | string): T[] => {
        const children: T[] = []
        entities.forEach(entity => {
          if ('parentId' in entity && entity.parentId === targetParentId) {
            children.push(entity)
            if ('children' in entity && (entity as any).children) {
              children.push(...collectChildren((entity as any).children, entity.id))
            }
          }
          if ('children' in entity && (entity as any).children) {
            children.push(...collectChildren((entity as any).children, targetParentId))
          }
        })
        return children
      }

      return collectChildren(base.entities, parentId)
    }, [base.entities])

    return {
      ...base,
      createChild,
      getAllChildren
    }
  }
}

export { createCrudOperations, createHierarchicalCrud }

