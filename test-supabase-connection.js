// Test de connexion à Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Lire .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const supabaseAnonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

console.log('🔍 Vérification des variables d\'environnement...\n');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL manquante');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...');
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquante');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 30) + '...');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Les variables d\'environnement ne sont pas configurées correctement');
  process.exit(1);
}

console.log('\n🚀 Tentative de connexion à Supabase...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Vérifier la connexion simple
    console.log('Test 1️⃣ : Test de health check...');
    const { data: healthData, error: healthError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Erreur:', healthError.message);
      console.error('Code:', healthError.code);
      return;
    }

    console.log('✅ Connexion établie avec succès!\n');

    // Test 2: Récupérer quelques produits
    console.log('Test 2️⃣ : Récupération des produits...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3);

    if (productsError) {
      console.error('❌ Erreur lors de la récupération des produits:', productsError.message);
      return;
    }

    if (!products || products.length === 0) {
      console.warn('⚠️  Aucun produit trouvé dans la base de données');
    } else {
      console.log(`✅ ${products.length} produits trouvés:\n`);
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ${product.price}€`);
      });
    }

    // Test 3: Compter le nombre total de produits
    console.log('\nTest 3️⃣ : Comptage des produits...');
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erreur lors du comptage:', countError.message);
      return;
    }

    console.log(`✅ Total de produits dans la base: ${count}`);

    console.log('\n✨ Tous les tests sont passés avec succès!');
    console.log('✅ La connexion à Supabase fonctionne correctement!');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

testConnection();
