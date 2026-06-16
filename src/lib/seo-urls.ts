// Central URL helpers — all taxonomy links use these functions
export const seoUrl = {
  category:        (slug: string) => `/${slug}-jobs`,
  location:        (slug: string) => `/in-${slug}`,
  employmentType:  (slug: string) => `/${slug}-jobs`,
  combined:        (catSlug: string, locSlug: string) => `/${catSlug}-jobs/in-${locSlug}`,
  combinedWithType:(typeSlug: string, catSlug: string, locSlug: string) =>
                     `/${typeSlug}-${catSlug}-jobs/in-${locSlug}`,
}
