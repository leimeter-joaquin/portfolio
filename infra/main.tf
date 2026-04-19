terraform {
  required_version = ">= 1.5"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  # Store state locally — add to .gitignore.
  # Migrate to Terraform Cloud (free) with a `cloud {}` block when ready.
  backend "local" {}
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
