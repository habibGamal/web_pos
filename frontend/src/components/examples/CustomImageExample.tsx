import Image from 'next/image'

/**
 * Example component demonstrating how to use the custom image loader
 * with Next.js Image component
 */
export default function ExampleImageComponent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Custom Image Loader Examples</h2>
      
      {/* Example 1: Product image */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Product Image</h3>
        <Image
          src="products/product-1.jpg" // This path will be passed to your custom loader
          alt="Product 1"
          width={300}
          height={200}
          className="rounded-lg"
        />
        <p className="text-sm text-gray-600 mt-2">
          Image URL will be: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/img/products/product-1.jpg?w=300&q=75
        </p>
      </div>

      {/* Example 2: Category image with custom quality */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Category Image (High Quality)</h3>
        <Image
          src="categories/electronics.jpg"
          alt="Electronics Category"
          width={400}
          height={250}
          quality={90} // Custom quality parameter
          className="rounded-lg"
        />
        <p className="text-sm text-gray-600 mt-2">
          Image URL will be: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/img/categories/electronics.jpg?w=400&q=90
        </p>
      </div>

      {/* Example 3: User avatar with fill */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">User Avatar (Fill)</h3>
        <div className="relative w-20 h-20 rounded-full overflow-hidden">
          <Image
            src="avatars/user-123.jpg"
            alt="User Avatar"
            fill
            className="object-cover"
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Using fill prop for responsive sizing
        </p>
      </div>

      {/* Example 4: Brand logo */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Brand Logo</h3>
        <Image
          src="brands/apple-logo.png"
          alt="Apple Brand"
          width={100}
          height={100}
          className="rounded"
        />
        <p className="text-sm text-gray-600 mt-2">
          Image URL will be: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/img/brands/apple-logo.png?w=100&q=75
        </p>
      </div>
    </div>
  )
}

/**
 * Usage in your components:
 * 
 * import Image from 'next/image'
 * 
 * function MyComponent() {
 *   return (
 *     <Image
 *       src="path/to/image.jpg"  // Just the path, custom loader handles the full URL
 *       alt="Description"
 *       width={500}
 *       height={300}
 *     />
 *   )
 * }
 */