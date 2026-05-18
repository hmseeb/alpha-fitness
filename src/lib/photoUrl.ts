const cache = new Map<string, string>()

export async function resolvePhoto(student: { photo_path?: string | null; photo_remote_path?: string | null }): Promise<string | null> {
  if (student.photo_path) return `file://${student.photo_path}`
  if (student.photo_remote_path) {
    const cached = cache.get(student.photo_remote_path)
    if (cached) return cached
    const url = await window.api.photos.remoteUrl(student.photo_remote_path)
    if (url) cache.set(student.photo_remote_path, url)
    return url
  }
  return null
}
