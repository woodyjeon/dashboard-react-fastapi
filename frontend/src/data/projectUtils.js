import { projects } from './projects'

export function getProjectPath(slug) {
  return `/portfolio/${slug}`
}

export function getProjectBySlug(slug) {
  return projects.find((project) => project.slug === slug) ?? null
}
