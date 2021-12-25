// TypeScript definitions for the CurseForge API

// ===== custom types =====

export type DateTimeString =
  `${number}-${number}-${number}T${number}:${number}:${number}Z`

// ===== cfcore types =====

export interface Category {
  /** The category id */
  id: number
  /** The game id related to the category */
  gameId: number
  /** Category name */
  name: string
  /** The category slug as it appear in the URL */
  slug: string
  /** The category URL */
  url: string
  /** URL for the category icon */
  iconUrl: string
  /** Last modified date of the category */
  dateModified: DateTimeString
  /** A top level category for other categories */
  isClass: boolean | null
  /** The class id of the category, meaning - the class of which this category is under */
  classId: number | null
  /** The parent category for this category */
  parentCategoryId: number | null
}

export enum CoreApiStatus {
  Private = 1,
  Public = 2,
}

export enum CoreStatus {
  Draft = 1,
  Test = 2,
  PendingReview = 3,
  Rejected = 4,
  Approved = 5,
  Live = 6,
}

export interface FeaturedModsResponse {
  featured: Mod[]
  popular: Mod[]
  recentlyUpdated: Mod[]
}

export interface File {
  /** The file id */
  id: number
  /** The game id related to the mod that this file belongs to */
  gameId: number
  /** The mod id */
  modId: number
  /** Whether the file is available to download */
  isAvailable: boolean
  /** Display name of the file */
  displayName: string
  /** Exact file name */
  fileName: string
  /** The file release type */
  releaseType: FileReleaseType
  /** Status of the file */
  fileStatus: FileStatus
  /** The file hash (i.e. md5 or sha1) */
  hashes: FileHash[]
  /** The file timestamp */
  fileDate: DateTimeString
  /** The file length in bytes */
  fileLength: number
  /** The number of downloads for the file */
  downloadCount: number
  /** The file download URL */
  downloadUrl: string
  /** List of game versions this file is relevant for */
  gameVersions: string[]
  /** Metadata used for sorting by game versions */
  sortableGameVersions: SortableGameVersion[]
  /** List of dependencies files */
  dependencies: FileDependency[]
  exposeAsAlternative: boolean | null
  parentProjectFileId: number | null
  alternateFileId: number | null
  isServerPack: boolean | null
  serverPackFileId: number | null
  fileFingerprint: number
  modules: FileModule[]
}

export interface FileDependency {
  modId: number
  fileId: number
  relationType: FileRelationType
}

export interface FileHash {
  value: string
  algo: HashAlgo
}

export interface FileIndex {
  gameVersion: string
  fileId: number
  filename: string
  releaseType: FileReleaseType
  gameVersionTypeid: number | null
  modLoader: ModLoaderType | null
}

export interface FileModule {
  name: string
  fingerprint: number
}

export enum FileRelationType {
  EmbeddedLibrary = 1,
  OptionalDependency = 2,
  RequiredDependency = 3,
  Tool = 4,
  Incompatible = 5,
  Include = 6,
}

export enum FileReleaseType {
  Release = 1,
  Beta = 2,
  Alpha = 3,
}

export enum FileStatus {
  Processing = 1,
  ChangesRequired = 2,
  UnderReview = 3,
  Approved = 4,
  Rejected = 5,
  MalwareDetected = 6,
  Deleted = 7,
  Archived = 8,
  Released = 10,
  ReadyForReview = 11,
  Deprecated = 12,
  Baking = 13,
  AwaitingPublishing = 14,
  FailedPublishing = 15,
}

export interface FingerprintFuzzyMatch {
  id: number
  file: File
  latestFiles: File[]
  fingerprints: number[]
}

export interface FingerprintFuzzyMatchResult {
  fuzzyMatches: FingerprintFuzzyMatch[]
}

export interface FingerprintMatch {
  id: number
  file: File
  latestFiles: File[]
}

export interface FingerprintsMatchesResult {
  isCacheBuilt: boolean
  exactMatches: FingerprintMatch[]
  exactFingerprints: number[]
  partialMatches: FingerprintMatch[]
  partialMatchFingerprints: object
  installedFingerprints: number[]
  unmatchedFingerprints: number[]
}

export interface FolderFingerprint {
  foldername: string
  fingerprints: number[]
}

export interface Game {
  id: number
  name: string
  slug: string
  dateModified: DateTimeString
  assets: GameAssets
  status: CoreStatus
  apiStatus: CoreApiStatus
}

export interface GameAssets {
  iconUrl: string
  tileUrl: string
  coverUrl: string
}

export interface GameVersionsByType {
  type: number
  versions: string[]
}

export interface GameVersionType {
  id: number
  gameId: number
}

export interface GetCategoriesResponse {
  /** The response data */
  data: Category[]
}

export interface GetFeaturedModsResponse {
  /** The response data */
  data: FeaturedModsResponse
}

export interface GetFilesResponse {
  /** The response data */
  data: File[]
}

export interface GetFingerprintMatchesResponse {
  /** The response data */
  data: FingerprintsMatchesResult
}

export interface GetFingerprintFuzzyMatchesResponse {
  /** The response data */
  data: FingerprintFuzzyMatchResult
}

export interface GetGameResponse {
  /** The response data */
  data: Game
}

export interface GetGamesResponse {
  /** The response data */
  data: Game[]
  /** The response pagination information */
  pagination: Pagination
}

export interface GetModFileResponse {
  /** The response data */
  data: File
}

export interface GetModFilesResponse {
  /** The response data */
  data: File[]
  /** The response pagination information */
  paginaton: Pagination
}

export interface GetModResponse {
  /** The response data */
  data: Mod
}

export interface GetModsResponse {
  /** The response data */
  data: Mod[]
}

export interface GetVersionTypesResponse {
  /** The response data */
  data: GameVersionType[]
}

export interface GetVersionsResponse {
  /** The response data */
  data: GameVersionsByType[]
}

export interface GetFeaturedModsRequestBody {
  gameId: number
  excludedModIds: number[]
  gameVersionTypeId: number
}

export interface GetFingerprintMatchesRequestBody {
  fingerprints: number[]
}

export interface GetFuzzyMatchesRequestBody {
  gameId: number
  fingerprints: FolderFingerprint[]
}

export interface GetModFilesRequestBody {
  fileIds: number[]
}

export interface GetModsByIdsListRequestBody {
  modIds: number[]
}

export enum HashAlgo {
  Sha1 = 1,
  Md5 = 2,
}

export interface Mod {
  /** The mod id */
  id: number
  /** The game id this mod is for */
  gameId: number
  /** The name of the mod */
  name: string
  /** The mod slug that would appear in the URL */
  slug: string
  /** Relevant links for the mod such as Issue tracker and Wiki */
  links: ModLinks
  /** Mod summary */
  summary: string
  /** Current mod status */
  status: ModStatus
  /** Number of downloads for the mod */
  downloadCount: number
  /** Whether the mod is included in the featured mods list */
  isFeatured: boolean
  /** The main category of the mod as it was chosen by the mod author */
  primaryCategoryId: number
  /** List of categories that this mod is related to */
  categories: Category[]
  /** List of the mod's authors */
  authors: ModAuthor[]
  /** The mod's logo asset */
  logo: ModAsset
  /** List of screenshots assets */
  screenshots: ModAsset[]
  /** The id of the main file of the mod */
  mainFileId: number
  /** List of latest files of the mod */
  latestFiles: File[]
  /** List of file related details for the latest files of the mod */
  latestFilesIndexes: FileIndex[]
  /** The creation date of the mod */
  dateCreated: DateTimeString
  /** The last time the mod was modified */
  dateModified: DateTimeString
  /** The release date of the mod */
  dateReleased: DateTimeString
}

export interface ModAsset {
  id: number
  modId: number
  title: string
  description: string
  thumbnailUrl: string
  url: string
}

export interface ModAuthor {
  id: number
  name: string
  url: string
}

export interface ModLinks {
  websiteUrl: string
  wikiUrl: string
  issuesUrl: string
  sourceUrl: string
}

export enum ModLoaderType {
  Any = 0,
  Forge = 1,
  Cauldron = 2,
  LiteLoader = 3,
  Fabric = 4,
}

export enum ModsSearchSortField {
  Featured = 1,
  Popularity = 2,
  LastUpdated = 3,
  Name = 4,
  Author = 5,
  TotalDownloads = 6,
  Category = 7,
  GameVersion = 8,
}

export enum ModStatus {
  New = 1,
  ChangesRequired = 2,
  UnderSoftReview = 3,
  Approved = 4,
  Rejected = 5,
  ChangesMade = 6,
  Inactive = 7,
  Abandoned = 8,
  Deleted = 9,
  UnderReview = 10,
}

export interface Pagination {
  /** A zero based index of the first item that is included in the response */
  index: number
  /** The requested number of items to be included in the response */
  pageSize: number
  /** The actual number of items that were included in the response */
  resultCount: number
  /** The total number of items available by the request */
  totalCount: number | null
}

export interface SearchModsResponse {
  /** The response data */
  data: Mod[]
  /** The response pagination information */
  paginaton: Pagination
}

export interface SortableGameVersion {
  /** Original version name (e.g. 1.5b) */
  gameVersionName: string
  /** Used for sorting (e.g. 0000000001.0000000005) */
  gameVersionPadded: string
  /** game version clean name (e.g. 1.5) */
  gameVersion: string
  /** Game version release date */
  gameVersionReleaseDate: DateTimeString
  /** Game version type id */
  gameVersionTypeId: number | null
}

// this one is missing in the docs
// https://docs.curseforge.com/?javascript#tocS_SortOrder
export type SortOrder = 'asc' | 'desc'

export interface StringResponse {
  /** The response data */
  data: string
}
