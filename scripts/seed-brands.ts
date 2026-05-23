import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Marques par catégorie
const brandsData = {
  'Réfrigérateurs': [
    { name: 'Samsung', slug: 'samsung', description: 'Électroménagers de haute technologie' },
    { name: 'LG', slug: 'lg', description: 'Appareils innovants et efficaces' },
    { name: 'Whirlpool', slug: 'whirlpool', description: 'Qualité et durabilité' },
    { name: 'Arçelik', slug: 'arcelik', description: 'Marque turque réputée' },
    { name: 'Beko', slug: 'beko', description: 'Électroménagers européens' },
  ],
  'Lave-linge': [
    { name: 'Bosch', slug: 'bosch', description: 'Technologie allemande premium' },
    { name: 'Electrolux', slug: 'electrolux', description: 'Innovation suédoise' },
    { name: 'Haier', slug: 'haier', description: 'Appareils modernes' },
    { name: 'Indesit', slug: 'indesit', description: 'Marque fiable et abordable' },
    { name: 'Candy', slug: 'candy', description: 'Design italien' },
  ],
  'Micro-ondes': [
    { name: 'Panasonic', slug: 'panasonic', description: 'Technologie japonaise' },
    { name: 'Sharp', slug: 'sharp', description: 'Équipements professionnels' },
    { name: 'Midea', slug: 'midea', description: 'Marque asiatique' },
    { name: 'Russell Hobbs', slug: 'russell-hobbs', description: 'Petit électroménager' },
  ],
  'Climatiseurs': [
    { name: 'Daikin', slug: 'daikin', description: 'Expert en climatisation' },
    { name: 'Fujitsu', slug: 'fujitsu', description: 'Technologie avancée' },
    { name: 'Trane', slug: 'trane', description: 'Solutions professionnelles' },
    { name: 'Midea', slug: 'midea', description: 'Marque asiatique leader' },
  ],
  'Téléviseurs': [
    { name: 'Sony', slug: 'sony', description: 'Technologie audiovisuelle' },
    { name: 'TCL', slug: 'tcl', description: 'Écrans haute résolution' },
    { name: 'Hisense', slug: 'hisense', description: 'Téléviseurs 4K' },
    { name: 'Philips', slug: 'philips', description: 'Innovation hollandaise' },
  ],
}

async function seedBrands() {
  try {
    console.log('🌱 Début du seed des marques...')

    // Récupérer toutes les catégories
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')

    if (categoryError) {
      console.error('❌ Erreur lors de la récupération des catégories:', categoryError)
      return
    }

    console.log(`✅ ${categories?.length || 0} catégories trouvées`)

    let totalBrandsCreated = 0
    let totalAssociations = 0

    // Boucle sur chaque catégorie et ses marques
    for (const [categoryName, brands] of Object.entries(brandsData)) {
      const category = categories?.find(c => c.name === categoryName)

      if (!category) {
        console.log(`⚠️  Catégorie "${categoryName}" non trouvée`)
        continue
      }

      console.log(`\n📂 Traitement de la catégorie: ${categoryName}`)

      for (const brand of brands) {
        try {
          // Vérifier si la marque existe déjà
          const { data: existingBrand, error: checkError } = await supabase
            .from('brands')
            .select('id')
            .eq('slug', brand.slug)
            .single()

          if (checkError && checkError.code !== 'PGRST116') {
            console.error(`Erreur lors de la vérification de la marque ${brand.name}:`, checkError)
            continue
          }

          let brandId: string

          if (existingBrand) {
            console.log(`  ℹ️  Marque existante: ${brand.name}`)
            brandId = existingBrand.id
          } else {
            // Créer la marque
            const { data: newBrand, error: createError } = await supabase
              .from('brands')
              .insert({
                name: brand.name,
                slug: brand.slug,
                description: brand.description,
              })
              .select('id')
              .single()

            if (createError) {
              console.error(`  ❌ Erreur création marque ${brand.name}:`, createError)
              continue
            }

            if (newBrand) {
              brandId = newBrand.id
              console.log(`  ✅ Créée: ${brand.name}`)
              totalBrandsCreated++
            } else {
              continue
            }
          }

          // Vérifier si l'association existe
          const { data: existingAssoc, error: assocCheckError } = await supabase
            .from('category_brands')
            .select('id')
            .eq('category_id', category.id)
            .eq('brand_id', brandId)
            .single()

          if (assocCheckError && assocCheckError.code !== 'PGRST116') {
            console.error(`Erreur lors de la vérification de l'association:`, assocCheckError)
            continue
          }

          if (!existingAssoc) {
            // Créer l'association
            const { error: linkError } = await supabase
              .from('category_brands')
              .insert({
                category_id: category.id,
                brand_id: brandId,
              })

            if (linkError) {
              console.error(`  ❌ Erreur association ${brand.name} à ${categoryName}:`, linkError)
            } else {
              console.log(`    🔗 Associée à ${categoryName}`)
              totalAssociations++
            }
          } else {
            console.log(`    ℹ️  Déjà associée à ${categoryName}`)
          }
        } catch (error) {
          console.error(`  ❌ Erreur lors du traitement de ${brand.name}:`, error)
        }
      }
    }

    console.log(`\n✅ Seed terminé!`)
    console.log(`   - ${totalBrandsCreated} nouvelles marques créées`)
    console.log(`   - ${totalAssociations} associations créées`)
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
  }
}

seedBrands()
