export function withBase(path: string) {
  return new URL(
    path.replace(/^\//, ""),
    "https://dummy" + import.meta.env.BASE_URL
  ).pathname
}
