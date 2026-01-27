import { IProduct } from './product.interface';
import { Product } from './product.model';
import QueryBuilder from '../../builder/QueryBuilder'; // Ensure path is correct

// 1. Create Product
const createProductIntoDB = async (payload: IProduct) => {
  const result = await Product.create(payload);
  return result;
};

// 2. Get All Products (Refactored with QueryBuilder)


const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  // Define which fields you want the 'searchTerm' to look into
  const searchableFields = ['name', 'description', 'category'];

  const productQuery = new QueryBuilder(Product.find(), query)
    .search(searchableFields) // Search logic
    .filter() // Filter logic (category=Plush)
    .sort() // Sort logic (sort=price)
    .paginate() // Pagination logic (page=1&limit=10)
    .fields(); // Field selection logic (fields=name,price)

  const result = await productQuery.modelQuery;

  // 🛠️ FIX: Calculate the meta data (total count, total pages)
  const meta = await productQuery.countTotal();

  // Return both result AND meta
  return {
    meta,
    result,
  };
};

export const ProductServices = {
  getAllProductsFromDB,
  // ... other functions
};

// 3. Get Single Product
const getSingleProductFromDB = async (id: string) => {
  const result = await Product.findById(id);
  return result;
};

// 4. Update Product
const updateProductIntoDB = async (id: string, payload: Partial<IProduct>) => {
  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

// 5. Delete Product
const deleteProductFromDB = async (id: string) => {
  const result = await Product.findByIdAndDelete(id);
  return result;
};

export const ProductService = {
  createProductIntoDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductIntoDB,
  deleteProductFromDB,
};
