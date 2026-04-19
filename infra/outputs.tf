output "kv_namespace_id" {
  description = "KV namespace ID — paste into server/wrangler.toml"
  value       = cloudflare_workers_kv_namespace.rate_limit.id
}

output "pages_url" {
  description = "Cloudflare Pages deployment URL"
  value       = "https://${cloudflare_pages_project.app.subdomain}"
}

output "worker_url" {
  description = "Worker URL (set as PUBLIC_API_URL in Pages env)"
  value       = "https://portfolio-server.leimeter-joaquin.workers.dev"
}
