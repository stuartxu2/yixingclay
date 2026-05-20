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
import sharp from "sharp"

// Raster mime types we re-encode to AVIF on upload. Anything else (PDF, SVG,
// fonts) passes through untouched. iPhone HEIC is included — sharp decodes it
// natively on the prebuilt libvips that ships with the npm sharp binary.
const RASTER_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/tiff",
])

// Match the policy in tools/to_avif.mjs and CLAUDE.md §2.A: cap at 2000px on
// the long edge, quality 55, 4:2:0 chroma. Effort lowered from 6 → 4 so the
// admin upload returns in a few seconds rather than ten-plus.
const AVIF_MAX_DIMENSION = 2000
const AVIF_QUALITY = 55
const AVIF_EFFORT = 4

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

    const inputBuffer = Buffer.from(file.content, "base64")
    const mime = file.mimeType?.toLowerCase() ?? ""

    let body: Buffer = inputBuffer
    let contentType = file.mimeType
    let filename = file.filename

    if (RASTER_MIME.has(mime)) {
      // Re-encode all raster uploads to a single AVIF variant. next/image will
      // still do per-request width responsive optimisation off this source.
      const before = inputBuffer.byteLength
      body = await sharp(inputBuffer, { failOn: "none" })
        .rotate() // apply EXIF orientation, then strip the tag
        .resize(AVIF_MAX_DIMENSION, AVIF_MAX_DIMENSION, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .avif({
          quality: AVIF_QUALITY,
          effort: AVIF_EFFORT,
          chromaSubsampling: "4:2:0",
        })
        .toBuffer()
      contentType = "image/avif"
      filename = file.filename.replace(/\.[^.]+$/, "") + ".avif"
      const after = body.byteLength
      const pct = ((1 - after / before) * 100).toFixed(1)
      this.logger_.info(
        `avif: ${file.filename} ${(before / 1024).toFixed(0)}KB → ${(
          after / 1024
        ).toFixed(0)}KB (-${pct}%)`
      )
    }

    const key = this.buildKey(filename)
    const blob = this.container_.getBlockBlobClient(key)
    await blob.uploadData(body, {
      blobHTTPHeaders: { blobContentType: contentType },
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
