import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const categories = [
  'Ropa',
  'Guitarras',
  'Electrónica',
  'Hogar',
  'Libros',
  'Juguetes',
  'Accesorios',
  'Computadoras',
  'Zapatos',
  'Deportes',
]

const productBaseNames: Record<string, string[]> = {
  Ropa: ['Camisa', 'Pantalón', 'Vestido', 'Chaqueta', 'Polera'],
  Guitarras: [
    'Guitarra acústica',
    'Guitarra eléctrica',
    'Amplificador',
    'Pedal de distorsión',
  ],
  Electrónica: ['Smartphone', 'Tablet', 'Smartwatch', 'Cámara digital'],
  Hogar: ['Silla', 'Mesa de comedor', 'Cama', 'Lámpara', 'Estante'],
  Libros: [
    'Guía de JavaScript',
    'Novela de misterio',
    'Manual de cocina',
    'Historias épicas',
  ],
  Juguetes: [
    'Muñeca interactiva',
    'Carro a control remoto',
    'Rompecabezas 3D',
    'Pelota mágica',
  ],
  Accesorios: [
    'Gorra urbana',
    'Reloj clásico',
    'Cinturón de cuero',
    'Bolso moderno',
  ],
  Computadoras: [
    'Laptop gamer',
    'Monitor 4K',
    'Teclado mecánico',
    'Mouse inalámbrico',
  ],
  Zapatos: [
    'Zapatillas deportivas',
    'Botas de montaña',
    'Sandalias playeras',
    'Zapatos de vestir',
  ],
  Deportes: [
    'Bicicleta MTB',
    'Balón oficial',
    'Guantes de boxeo',
    'Raqueta profesional',
  ],
}

const unsplashKeywords: Record<string, string> = {
  Ropa: 'clothing',
  Guitarras: 'guitar',
  Electrónica: 'electronics',
  Hogar: 'furniture',
  Libros: 'books',
  Juguetes: 'toys',
  Accesorios: 'fashion',
  Computadoras: 'computer,laptop',
  Zapatos: 'shoes',
  Deportes: 'sports',
}

async function main() {
  const categoryRecords = await Promise.all(
    categories.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  )

  const totalProducts = 5000
  const batchSize = 500

  for (let i = 0; i < totalProducts; i += batchSize) {
    const products = Array.from({ length: batchSize }).map(() => {
      const category = faker.helpers.arrayElement(categoryRecords)
      const baseNames = productBaseNames[category.name] || ['Producto genérico']
      const baseName = faker.helpers.arrayElement(baseNames)

      // Añadir modelo/edición para hacerlo único
      const version = faker.helpers.arrayElement([
        'Pro',
        'X',
        'Plus',
        'Max',
        '2024',
        'Limited Edition',
        'Ultra',
        'Prime',
      ])

      const name = `${baseName} ${version}`
      const keyword = unsplashKeywords[category.name] || 'product'

      const description = `El ${baseName} ${version} es perfecto para quienes buscan calidad y diseño en el mundo de ${category.name.toLowerCase()}. Diseñado con materiales duraderos y estilo moderno.`

      return {
        name,
        description,
        price: parseFloat(faker.commerce.price({ min: 50, max: 2000 })),
        imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(keyword)}`,
        categoryId: category.id,
      }
    })

    await prisma.product.createMany({ data: products })
    console.log(`✅ Insertados ${i + batchSize} / ${totalProducts}`)
  }

  console.log('🎉 Seed completo con nombres coherentes y únicos por categoría.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
