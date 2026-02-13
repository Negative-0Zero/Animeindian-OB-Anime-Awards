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
  // Pass slug directly – the client will handle missing/undefined
  return <CategoryClient slug={params?.slug} />
}
