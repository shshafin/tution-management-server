import { Blog } from './blog.model';
import { IBlog } from './blog.interface';
import QueryBuilder from '../../builder/QueryBuilder';

// Create
const createBlogIntoDB = async (payload: IBlog) => {
  const result = await Blog.create(payload);
  return result;
};

// Get All (With Search & Filter)
const getAllBlogsFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['title', 'content']; // Search in title OR content

  const blogQuery = new QueryBuilder(Blog.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await blogQuery.modelQuery;
  return result;
};

// Get Single
const getSingleBlogFromDB = async (id: string) => {
  const result = await Blog.findById(id);
  return result;
};

// Update
const updateBlogIntoDB = async (id: string, payload: Partial<IBlog>) => {
  const result = await Blog.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

// Delete
const deleteBlogFromDB = async (id: string) => {
  const result = await Blog.findByIdAndDelete(id);
  return result;
};

export const BlogService = {
  createBlogIntoDB,
  getAllBlogsFromDB,
  getSingleBlogFromDB,
  updateBlogIntoDB,
  deleteBlogFromDB,
};
