export type TEntity = {
    id: number | string
    createdAt: Date
    updatedAt: Date
}

export type TOptimisticAction<T extends TEntity> = {
    type: "CREATE" | "UPDATE" | "DELETE" | "MOVE"
    entity: T
    tempId?: string
    updates?: Partial<T>
    targetId?: number | string
    position?: number
}

export type TCrudConfig<T extends TEntity> = {
    entityName: string
    tempIdPrefix: string
    defaultValues: Omit<T, "id" | "createdAt" | "updatedAt">
    validationRules?: (entity: T) => boolean
    onSuccess?: (action: string, entity: T) => void
    onError?: (action: string, error: Error, entity?: T) => void
}

export type TMutationHandlers<T extends TEntity> = {
    create: (data: Omit<T, "id" | "createdAt" | "updatedAt">) => Promise<T>
    update: (id: number | string, data: Partial<T>) => Promise<T>
    delete: (id: number | string) => Promise<void>
    move?: (id: number | string, targetId: number | string, position?: number) => Promise<T>
}
