import { supabase } from '@/utils/supabase/client'
import CategoryClient from './CategoryClient'

export async function generateStaticParams() {
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
  return categories?.map(({ slug }) => ({ slug })) || []
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <CategoryClient slug={params?.slug} />
}
