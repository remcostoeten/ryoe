"use client"

import { useState, useEffect, useCallback } from "react"
import { checkDatabaseHealth, type DatabaseHealth } from "@/api/db"

type UseDatabaseHealthProps = {
  interval?: number
}

export function useDatabaseHealth({ interval = 30000 }: UseDatabaseHealthProps = {}) {
  const [health, setHealth] = useState<DatabaseHealth>({
    status: "checking",
    message: "Checking database connection...",
    lastChecked: new Date(),
    responseTime: undefined,
  })
  const [isLoading, setIsLoading] = useState(false)

  const checkHealth = useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await checkDatabaseHealth()
      setHealth(result)
    } catch (error) {
      setHealth({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        lastChecked: new Date(),
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    checkHealth()
  }, [checkHealth])

  useEffect(() => {
    checkHealth()

    const intervalId = setInterval(checkHealth, interval)

    return () => clearInterval(intervalId)
  }, [checkHealth, interval])

  return { health, isLoading, refresh }
}
