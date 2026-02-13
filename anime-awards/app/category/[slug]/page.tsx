import { supabase } from '@/utils/supabase/client'
import CategoryClient from './CategoryClient'

export async function generateStaticParams() {
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
  
  // Log for debugging (visible in build logs)
  console.log('Categories for static params:', categories)
  
  return categories?.map(({ slug }) => ({ slug })) || []
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  // Add a fallback in case params is missing (shouldn't happen)
  if (!params?.slug) {
    return <div>Error: Missing slug</div>
  }
  return <CategoryClient slug={params.slug} />
}
