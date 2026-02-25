import { supabase } from '@/utils/supabase/client'
import CategoryClient from './CategoryClient'

// Allow on-demand generation for new slugs
export const dynamicParams = true

export async function generateStaticParams() {
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
  return categories?.map(({ slug }) => ({ slug })) || []
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <CategoryClient slug={params?.slug} />
}
