import type { FetchOptions } from 'ofetch'
import type { Ref } from 'vue'
import { useState, useNuxtApp, useRoute, useRuntimeConfig } from '#app'
import { hash } from 'ohash'
import type { T3InitialData, T3Page } from '../../module'
import type { T3Api } from '../lib/apiClient'

/**
 * Get page data state
 * @returns {Ref<T3Page>}
 */
export const useT3PageState = () => {
  const pageState = useState<T3Page | null>('T3:Page')
  return pageState
}

/**
 * Get initial data state
 * @returns {Ref<T3InitialData>}
 */
export const useT3InitialDataState = () => {
  const initialDataState = useState<T3InitialData>('T3:InitialData')
  return initialDataState
}

/**
 * Use API client as composable
 * @param {String} path
 * @param {FetchOptions} options
 */
export const useT3Api = (
  path?: string,
  options?: FetchOptions<'json'>
): {
  /**
   * TYPO3 Page Data
   */
  pageData: Ref<T3Page | null>
  /**
   * TYPO3 Initial Data
   */
  initialData: Ref<T3InitialData>
  /**
   * Sharable $fetch client for TYPO3 API
   */
  $fetch: T3Api['$fetch']
  /**
   * Get TYPO3 Page data
   */
  getPage(path: string, options?: FetchOptions): Promise<T3Page>
  /**
   * Get unique cache key for TYPO3 page data based on route full path.
   * Falls back to a static key if Nuxt version < 3.17.0 (changed useAsyncData implementation).
   */
  getPageKey(fullPath?: string): string
  /**
   * Get TYPO3 Initial data
   */
  getInitialData(path?: string, options?: FetchOptions): Promise<T3InitialData>
  /**
   * Set API Headers
   */
  setHeaders(headers: Record<string, string>): void,
  /**
   * Set API Client global options
   */
  setOption<T extends keyof FetchOptions<'json'>>(key: T, value:FetchOptions<'json'>[T]): void
} => {
  const app = useNuxtApp()
  const { $typo3, callHook } = app
  const defaultPath = path || useRoute().fullPath
  const defaultOptions = options!
  const pageData = useT3PageState()
  const initialData = useT3InitialDataState()
  const useLegacyAsyncDataPageKey = useRuntimeConfig().public.typo3Internals?.useLegacyAsyncDataPageKey

  const $fetch = async <T>(
    path: RequestInfo = defaultPath,
    options: FetchOptions<'json'> = defaultOptions
  ): Promise<T> => {
    return await $typo3.api.$fetch(path, options)
  }

  const getPage = async (
    path: string = defaultPath,
    options: FetchOptions<'json'> = defaultOptions
  ) => {
    const pageData = await $typo3.api.getPage(path, options)
    await callHook('t3:page', pageData)
    return pageData
  }

  const getPageKey = (fullPath = defaultPath): string => {
    return useLegacyAsyncDataPageKey
      ? 't3:page'
      : `t3:page:${hash(fullPath)}`
  }

  const getInitialData = async (
    path: string = defaultPath,
    options: FetchOptions<'json'> = defaultOptions
  ) => {
    const initialData = await $typo3.api.getInitialData(path, options)
    await callHook('t3:initialData', initialData)
    return initialData
  }

  const setHeaders = (headers: Record<string, string>) => {
    $typo3.api.setHeaders(headers)
  }

  const setOption = <T extends keyof FetchOptions<'json'>>(key: T, value:FetchOptions<'json'>[T]) => {
    $typo3.api.fetchOptions[key] = value
  }

  return {
    pageData,
    initialData,
    $fetch,
    getPage,
    getPageKey,
    getInitialData,
    setHeaders,
    setOption
  }
}
