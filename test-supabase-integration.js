// Test complet: Vérifier que tous les produits viennent de Supabase
const fs = require('fs');
const path = require('path');

console.log('📋 AUDIT COMPLET: Vérification que tous les produits utilisent Supabase\n');

// Fichiers à vérifier
const filesToCheck = [
  { file: 'app/products/page.tsx', shouldUseSupabase: true },
  { file: 'app/product/[id]/page.tsx', shouldUseSupabase: true },
  { file: 'components/products-section.tsx', shouldUseSupabase: true },
  { file: 'app/cart/page.tsx', shouldUseSupabase: false }, // Utilise localStorage
];

let allGood = true;

filesToCheck.forEach(({ file, shouldUseSupabase }) => {
  const filePath = path.join(__dirname, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const usesSupabase = content.includes('getProductsFromSupabase') || content.includes('getProductByIdFromSupabase');
  const usesStaticProducts = content.includes("from '@/lib/products'") && content.includes("import { products");
  
  console.log(`\n📄 ${file}`);
  
  if (shouldUseSupabase) {
    if (usesSupabase) {
      console.log(`   ✅ Utilise Supabase correctement`);
    } else {
      console.log(`   ❌ N'utilise PAS Supabase - PROBLÈME!`);
      allGood = false;
    }
  } else {
    console.log(`   ✅ N'a pas besoin de Supabase (localStorage)`);
  }
  
  if (usesStaticProducts) {
    console.log(`   ⚠️  Attention: Importe aussi les produits statiques locaux`);
  }
});

console.log('\n' + '='.repeat(60));

if (allGood) {
  console.log('\n✨ SUCCÈS: Tous les produits utilisent Supabase correctement!');
  console.log('\n📊 Résumé:');
  console.log('   • Page d\'accueil (ProductsSection): Supabase ✅');
  console.log('   • Page /products: Supabase ✅');
  console.log('   • Page /product/[id]: Supabase ✅');
  console.log('   • Panier (localStorage): Pas besoin ✅');
  console.log('\nL\'application est maintenant entièrement intégrée à Supabase!');
} else {
  console.log('\n❌ ERREUR: Certaines pages n\'utilisent pas Supabase');
}
