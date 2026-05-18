import { Readable } from "stream"
import {
  AbstractFileProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type { FileTypes, Logger } from "@medusajs/framework/types"
import {
  BlobServiceClient,
  type ContainerClient,
} from "@azure/storage-blob"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  /** Azure Storage account connection string. */
  connectionString: string
  /** Blob container that holds uploaded media. Defaults to "media". */
  containerName?: string
}

/**
 * File Module provider backed by Azure Blob Storage.
 *
 * Medusa's containers are stateless, so the default local-disk file provider
 * loses every admin-uploaded image on redeploy. This provider stores uploads
 * in a public-read blob container instead, giving durable, CDN-friendly URLs.
 */
export default class AzureFileProviderService extends AbstractFileProviderService {
  static identifier = "azure-blob"

  protected readonly logger_: Logger
  protected readonly container_: ContainerClient

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.container_ = BlobServiceClient.fromConnectionString(
      options.connectionString
    ).getContainerClient(options.containerName ?? "media")
  }

  static validateOptions(options: Record<string, unknown>): void {
    if (!options.connectionString) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Azure file provider requires a `connectionString` option."
      )
    }
  }

  async upload(
    file: FileTypes.ProviderUploadFileDTO
  ): Promise<FileTypes.ProviderFileResultDTO> {
    if (!file?.filename) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No file provided to upload."
      )
    }

    const key = this.buildKey(file.filename)
    const blob = this.container_.getBlockBlobClient(key)
    await blob.uploadData(Buffer.from(file.content, "base64"), {
      blobHTTPHeaders: { blobContentType: file.mimeType },
    })

    return { url: blob.url, key }
  }

  async delete(
    files: FileTypes.ProviderDeleteFileDTO | FileTypes.ProviderDeleteFileDTO[]
  ): Promise<void> {
    const list = Array.isArray(files) ? files : [files]
    await Promise.all(
      list.map((f) =>
        this.container_.getBlockBlobClient(f.fileKey).deleteIfExists()
      )
    )
  }

  // The `media` container is public-read, so the blob URL *is* the download
  // URL — no presigning needed. Permanent URLs also keep CDN caching and SEO
  // working for product imagery.
  async getPresignedDownloadUrl(
    fileData: FileTypes.ProviderGetFileDTO
  ): Promise<string> {
    return this.container_.getBlockBlobClient(fileData.fileKey).url
  }

  async getDownloadStream(
    fileData: FileTypes.ProviderGetFileDTO
  ): Promise<Readable> {
    const res = await this.container_
      .getBlockBlobClient(fileData.fileKey)
      .download()
    return res.readableStreamBody as Readable
  }

  async getAsBuffer(
    fileData: FileTypes.ProviderGetFileDTO
  ): Promise<Buffer> {
    return this.container_
      .getBlockBlobClient(fileData.fileKey)
      .downloadToBuffer()
  }

  /**
   * Prefix the original filename with a timestamp so re-uploads of a file with
   * the same name don't silently overwrite each other in the container.
   */
  private buildKey(filename: string): string {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
    return `${Date.now()}-${safe}`
  }
}
