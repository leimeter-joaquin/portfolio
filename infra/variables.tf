variable "cloudflare_api_token" {
  description = "Cloudflare API token with Workers, Pages, and KV permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID (found in dashboard sidebar)"
  type        = string
}

variable "app_origin" {
  description = "Public URL of the Astro frontend (used for CORS on the Worker)"
  type        = string
  default     = ""
}
