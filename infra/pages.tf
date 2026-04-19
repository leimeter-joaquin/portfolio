resource "cloudflare_pages_project" "app" {
  account_id        = var.cloudflare_account_id
  name              = "portfolio-app"
  production_branch = "main"

  build_config {
    build_command   = "npm run build"
    destination_dir = "app/dist"
  }

  deployment_configs {
    production {
      environment_variables = {
        PUBLIC_API_URL = "https://portfolio-server.leimeter-joaquin.workers.dev"
      }
      compatibility_date  = "2024-09-23"
    }
  }
}
