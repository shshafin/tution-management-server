import { IProduct } from './product.interface';
import { Product } from './product.model';

// 1. Create Product
const createProductIntoDB = async (payload: IProduct) => {
  const result = await Product.create(payload);
  return result;
};

// 2. Get All Products (With Search & Filter)
const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const queryObj = { ...query }; // Copy query to avoid mutating original

  // A. Searching (Partial Match on Name or Description)
  let searchTerm = '';
  if (query?.searchTerm) {
    searchTerm = query.searchTerm as string;
  }

  const searchQuery = Product.find({
    $or: ['name', 'description'].map((field) => ({
      [field]: { $regex: searchTerm, $options: 'i' }, // 'i' = case insensitive
    })),
  });

  // B. Filtering (Remove special fields like searchTerm, sort, etc.)
  const excludeFields = ['searchTerm', 'sort', 'page', 'limit'];
  excludeFields.forEach((el) => delete queryObj[el]);

  // C. Execute Query
  // We chain find(queryObj) to apply category filters etc.
  // We sort by createdAt: -1 to show newest products first
  const result = await searchQuery.find(queryObj).sort({ createdAt: -1 });

  return result;
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
