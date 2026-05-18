import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import AzureFileProviderService from "./service"

// Registers AzureFileProviderService as a provider of the File Module.
export default ModuleProvider(Modules.FILE, {
  services: [AzureFileProviderService],
})
