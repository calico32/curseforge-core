/* eslint-disable @typescript-eslint/member-delimiter-style */
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
// TODO: switch error cause to ES2022 error cause when it's available
import 'error-cause/auto'
import { EventEmitter } from 'node:events'
import {
  GetCategoriesResponse,
  GetFeaturedModsRequestBody,
  GetFeaturedModsResponse,
  GetFilesResponse,
  GetFingerprintFuzzyMatchesResponse,
  GetFingerprintMatchesRequestBody,
  GetFingerprintMatchesResponse,
  GetFuzzyMatchesRequestBody,
  GetGameResponse,
  GetGamesResponse,
  GetModFileResponse,
  GetModFilesRequestBody,
  GetModFilesResponse,
  GetModResponse,
  GetModsByIdsListRequestBody,
  GetModsResponse,
  GetVersionsResponse,
  GetVersionTypesResponse,
  ModsSearchSortField,
  SearchModsResponse,
  SortOrder,
  StringResponse,
} from './cfcore.js'

export interface CFCoreClientOptions {
  /** The base URL of the API (defaults to `https://api.curseforge.com`) */
  baseURL?: string
  /** The API key to use for authentication */
  apiKey: string
}

export interface ResponseData<T> {
  response: AxiosResponse<T>
  result: T
}
export type Result<T, O = never> = Promise<ResponseData<T> | O>

export interface PaginationOptions {
  /** A zero based index of the first item that is included in the response */
  index: number
  /** The requested number of items to be included in the response */
  pageSize: number
}

export interface SearchModsOptions extends PaginationOptions {
  /** Filter by game id */
  gameId?: number
  /** Filter by section id */
  classId?: number
  /** Filter by category id */
  categoryId?: number
  /** Filter by game version string */
  gameVersion?: string
  /** Filter by free text search in the mod name and author */
  searchFilter?: string
  /** Filter by ModsSearchSortField enumeration */
  sortField?: ModsSearchSortField | number
  /** Filter by ascending or descending order */
  sortOrder?: SortOrder
  /** Filter only addons associated to a given modloader (Forge, Fabric ...) */
  modLoaderType?: any // TODO investigate
  /** Filter only mods that contain files tagged with versions of the given gameVersionTypeId */
  gameVersionTypeId?: number
}

export interface GetModFilesOptions extends PaginationOptions {
  /** Filter by game versions of the given gameVersionTypeId */
  gameVersionTypeId?: number
}

export class CFCoreInternalServerError extends Error {
  constructor({ message, cause }: { message?: string; cause?: unknown } = {}) {
    super(message ?? 'Internal server error. Please try again later.', {
      cause,
    })
    this.name = 'CFCoreInternalServerError'
  }
}

export class CFCoreServiceUnavailableError extends Error {
  constructor({ message, cause }: { message?: string; cause?: unknown } = {}) {
    super(message ?? 'Service unavailable. Please try again later.', { cause })
    this.name = 'CFCoreServiceUnavailableError'
  }
}

export class CFCoreNotFoundError extends Error {
  constructor({ message, cause }: { message?: string; cause?: unknown } = {}) {
    super(message ?? 'Not found.', { cause })
    this.name = 'CFCoreNotFoundError'
  }
}

export class CFCoreBadRequestError extends Error {
  constructor({ message, cause }: { message?: string; cause?: unknown } = {}) {
    super(message ?? 'Bad request.', { cause })
    this.name = 'CFCoreBadRequestError'
  }
}

/**
 * The CFCoreClient class provides a client for the [CurseForge Core API](https://docs.curseforge.com/) (v1).
 *
 * Request methods return a {@link Promise} that resolves to {@link ResponseData}.
 *
 * Methods may throw a {@link CFCoreInternalServerError} if the server returns an error.
 */
export class CFCoreClient extends EventEmitter {
  constructor(private readonly options: CFCoreClientOptions) {
    super({ captureRejections: true })

    if (!options.apiKey) {
      throw new Error('API key is required')
    }

    options.baseURL ??= 'https://api.curseforge.com'
  }

  #makeHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.options.apiKey,
    }
  }

  async #request<T>(
    path: string,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<T, any>> {
    try {
      return await axios.request({
        baseURL: this.options.baseURL,
        url: path,
        method: 'GET',
        headers: this.#makeHeaders(),
        ...options,
      })
    } catch (err) {
      if ((err as AxiosError).response) {
        if ((err as AxiosError).response!.status === 503) {
          throw new CFCoreServiceUnavailableError({ cause: err })
        } else if ((err as AxiosError).response!.status >= 500) {
          throw new CFCoreInternalServerError({ cause: err })
        } else if ((err as AxiosError).response!.status === 404) {
          throw new CFCoreNotFoundError({ cause: err })
        } else if ((err as AxiosError).response!.status === 400) {
          throw new CFCoreBadRequestError({ cause: err })
        }
      }

      throw err
    }
  }

  /**
   * #### Get Games
   *
   * `GET /v1/games`
   *
   * Get all games that are available to the provided API key.
   *
   * @param index A zero based index of the first item to include in the response
   * @param pageSize The number of items to include in the response
   *
   * @returns The game data.
   */
  async getGames(index?: number, pageSize?: number): Result<GetGamesResponse> {
    const response = await this.#request<GetGamesResponse>('/v1/games', {
      params: { index, pageSize },
    })

    return { result: response.data, response }
  }

  /**
   * #### Get Game
   *
   * `GET /v1/games/{gameId}`
   *
   * Get a single game.
   *
   * A private game is only accessible by its respective API key.
   *
   * @param gameId A game unique id
   *
   * @returns The game data.
   *
   * @throws {@link CFCoreNotFoundError}: If the game is private or the game does not exist.
   */
  async getGame(gameId: number): Result<GetGameResponse> {
    const response = await this.#request<GetGameResponse>(`/v1/games/${gameId}`)
    return { result: response.data, response }
  }

  /**
   * #### Get Versions
   *
   * `GET /v1/games/{gameId}/versions`
   *
   * Get all available versions for each known version type of the specified game.
   *
   * A private game is only accessible to its respective API key.
   *
   * @param gameId A game unique id
   *
   * @returns The version data.
   *
   * @throws {@link CFCoreNotFoundError}: If the game is private or the game does not exist.
   */
  async getVersions(gameId: number): Result<GetVersionsResponse> {
    const response = await this.#request<GetVersionsResponse>(
      `/v1/games/${gameId}/versions`
    )
    return { result: response.data, response }
  }

  /**
   * #### Get Version Types
   *
   * `GET /v1/games/{gameId}/version-types`
   *
   * Get all available version types of the specified game.
   *
   * A private game is only accessible to its respective API key.
   *
   * Currently, when creating games via the CurseForge Core Console, you are limited to a single
   * game version type. This means that this endpoint is probably not useful in most cases and is
   * relevant mostly when handling existing games that have multiple game versions such as World of
   * Warcraft and Minecraft (e.g. 517 for wow_retail).
   *
   * @param gameId A game unique id
   *
   * @returns The version type data.
   *
   * @throws {@link CFCoreNotFoundError}: If the game is private or the game does not exist.
   */
  async getVersionTypes(gameId: number): Result<GetVersionTypesResponse> {
    const response = await this.#request<GetVersionTypesResponse>(
      `/v1/games/${gameId}/version-types`
    )
    return { result: response.data, response }
  }

  /**
   * #### Get Categories
   *
   * `GET /v1/categories`
   *
   * Get all available classes and categories of the specified game. Specify a game id for a list of
   * all game categories, or a class id for a list of categories under that class.
   *
   * @param gameId A game unique id
   * @param classId A class unique id
   *
   * @returns The category data.
   */
  async getCategories(
    gameId?: number,
    classId?: number
  ): Result<GetCategoriesResponse> {
    const response = await this.#request<GetCategoriesResponse>(
      '/v1/categories',
      { params: { gameId, classId } }
    )
    return { result: response.data, response }
  }

  /**
   *
   * #### Search Mods
   *
   * `GET /v1/mods/search`
   *
   * Get all mods that match the search criteria.
   *
   *
   * @param options The search options.
   *
   * @throws {@link CFCoreBadRequestError}: If the search options are invalid.
   */
  async searchMods(options: SearchModsOptions): Result<SearchModsResponse> {
    const response = await this.#request<SearchModsResponse>(
      '/v1/mods/search',
      { params: options }
    )
    return { result: response.data, response }
  }

  /**
   * #### Get Mod
   *
   * `GET /v1/mods/{modId}`
   *
   * Get a single mod.
   *
   * @param modId The mod id
   *
   * @returns The mod data.
   *
   * @throws {@link CFCoreNotFoundError}: If the mod does not exist.
   */
  async getMod(modId: number): Result<GetModResponse> {
    const response = await this.#request<GetModResponse>(`/v1/mods/${modId}`)
    return { result: response.data, response }
  }

  /**
   * #### Get Mods
   *
   * `POST /v1/mods`
   *
   * Get a list of mods.
   *
   * @param body Request body containing an array of mod ids
   *
   * @returns The mod data.
   *
   * @throws {@link CFCoreBadRequestError}: If the request body is invalid.
   * @throws {@link CFCoreNotFoundError}: If one or more mods do not exist.
   */
  async getMods(body: GetModsByIdsListRequestBody): Result<GetModsResponse> {
    const response = await this.#request<GetModsResponse>('/v1/mods', {
      method: 'POST',
      data: body,
      headers: {
        ...this.#makeHeaders(),
        'Content-Type': 'application/json',
      },
    })
    return { result: response.data, response }
  }

  /**
   * #### Get Featured Mods
   *
   * `POST /v1/mods/featured`
   *
   * Get a list of featured, popular and recently updated mods.
   *
   * @param body Match results for a game and exclude specific mods
   *
   * @throws {@link CFCoreBadRequestError}: If the request body is invalid.
   * @throws {@link CFCoreNotFoundError}: If one or more mods do not exist.
   */
  async getFeaturedMods(
    body: GetFeaturedModsRequestBody
  ): Result<GetFeaturedModsResponse> {
    const response = await this.#request<GetFeaturedModsResponse>(
      '/v1/mods/featured',
      {
        method: 'POST',
        data: body,
        headers: {
          ...this.#makeHeaders(),
          'Content-Type': 'application/json',
        },
      }
    )
    return { result: response.data, response }
  }

  /**
   * #### Get Mod Description
   *
   * `GET /v1/mods/{modId}/description`
   *
   * Get the full description of a mod in HTML format.
   *
   * @param modId The mod id
   *
   * @returns The mod description.
   *
   * @throws {@link CFCoreNotFoundError}: If the mod does not exist.
   */
  async getModDescription(modId: number): Result<StringResponse> {
    const response = await this.#request<StringResponse>(
      `/v1/mods/${modId}/description`
    )
    return { result: response.data, response }
  }

  /**
   * Get Mod File
   *
   * `GET /v1/mods/{modId}/files/{fileId}`
   *
   * Get a single file of the specified mod.
   *
   * @param modId The mod id the file belongs to
   * @param fileId The file id
   *
   * @returns The file data.
   *
   * @throws {@link CFCoreNotFoundError}: If the mod or file does not exist.
   */
  async getModFile(modId: number, fileId: number): Result<GetModFileResponse> {
    const response = await this.#request<GetModFileResponse>(
      `/v1/mods/${modId}/files/${fileId}`
    )
    return { result: response.data, response }
  }

  /**
   * #### Get Mod Files
   *
   * `GET /v1/mods/{modId}/files`
   *
   * Get all the files of the specified mod.
   *
   * @param modId The mod id the files belong to
   * @param options The search options
   *
   * @returns The file data.
   *
   * @throws {@link CFCoreNotFoundError}: If the mod does not exist, or if there are no results.
   */
  async getModFiles(
    modId: number,
    options?: GetModFilesOptions
  ): Result<GetModFilesResponse> {
    const response = await this.#request<GetModFilesResponse>(
      `/v1/mods/${modId}/files`,
      { params: options }
    )
    return { result: response.data, response }
  }

  /**
   * #### Get Files
   *
   * `POST /v1/mods/files`
   *
   * Get a list of files.
   *
   * @param body Request body containing an array of file ids to fetch
   *
   * @returns The file data.
   *
   * @throws {@link CFCoreBadRequestError}: If the request body is invalid.
   * @throws {@link CFCoreNotFoundError}: If one or more files do not exist.
   */
  async getFiles(body: GetModFilesRequestBody): Result<GetFilesResponse> {
    const response = await this.#request<GetFilesResponse>('/v1/mods/files', {
      method: 'POST',
      data: body,
      headers: {
        ...this.#makeHeaders(),
        'Content-Type': 'application/json',
      },
    })
    return { result: response.data, response }
  }

  /**
   * #### Get Mod File Changelog
   *
   * `GET /v1/mods/{modId}/files/{fileId}/changelog`
   *
   * Get the changelog of a file in HTML format.
   *
   * @param modId The mod id the file belongs to
   * @param fileId The file id
   *
   * @returns The file changelog.
   *
   * @throws {@link CFCoreNotFoundError}: If the mod or file does not exist.
   */
  async getModFileChangelog(
    modId: number,
    fileId: number
  ): Result<StringResponse> {
    const response = await this.#request<StringResponse>(
      `/v1/mods/${modId}/files/${fileId}/changelog`
    )
    return { result: response.data, response }
  }

  /**
   * #### Get Mod File Download URL
   *
   * `GET /v1/mods/{modId}/files/{fileId}/download-url`
   *
   * Get the download url for a specific file.
   *
   * @param modId The mod id the file belongs to
   * @param fileId The file id
   *
   * @returns The file download url.
   *
   * @throws {@link CFCoreNotFoundError}: If the mod or file does not exist.
   */
  async getModFileDownloadUrl(
    modId: number,
    fileId: number
  ): Result<StringResponse> {
    const response = await this.#request<StringResponse>(
      `/v1/mods/${modId}/files/${fileId}/download-url`
    )
    return { result: response.data, response }
  }

  /**
   * #### Get Fingerprints Matches
   *
   * `POST /v1/fingerprints`
   *
   * Get mod files that match a list of fingerprints.
   *
   * @param body The request body containing an array of fingerprints
   *
   * @returns The mod files that match the fingerprints.
   *
   * @throws {@link CFCoreBadRequestError}: If the request body is invalid.
   * @throws {@link CFCoreServiceUnavailableError}: If the service is unavailable.
   */
  async getFingerprintsMatches(
    body: GetFingerprintMatchesRequestBody
  ): Result<GetFingerprintMatchesResponse> {
    const response = await this.#request<GetFingerprintMatchesResponse>(
      '/v1/fingerprints',
      {
        method: 'POST',
        data: body,
        headers: {
          ...this.#makeHeaders(),
          'Content-Type': 'application/json',
        },
      }
    )
    return { result: response.data, response }
  }

  /**
   * #### Get Fingerprints Fuzzy Matches
   *
   * `POST /v1/fingerprints/fuzzy`
   *
   * Get mod files that match a list of fingerprints using fuzzy matching.
   *
   * @param body Game id and folder fingerprints options for the fuzzy matching
   *
   * @returns The mod files that match the fingerprints.
   *
   * @throws {@link CFCoreBadRequestError}: If the request body is invalid.
   * @throws {@link CFCoreServiceUnavailableError}: If the service is unavailable.
   */
  async getFingerprintsFuzzyMatches(
    body: GetFuzzyMatchesRequestBody
  ): Result<GetFingerprintFuzzyMatchesResponse> {
    const response = await this.#request<GetFingerprintFuzzyMatchesResponse>(
      '/v1/fingerprints/fuzzy',
      {
        method: 'POST',
        data: body,
        headers: {
          ...this.#makeHeaders(),
          'Content-Type': 'application/json',
        },
      }
    )
    return { result: response.data, response }
  }
}
