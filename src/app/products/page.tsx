// src/app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import './products.css';

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // حالة البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // حالة النموذج
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }

    fetchProducts();
  }, [session, status, router, currentPage, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter })
      });

      const response = await fetch(`/api/products?${params}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات المنتجات');
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

const handleDelete = async (productId: string, productName: string) => {
  if (!confirm(`هل أنت متأكد من حذف المنتج "${productName}"؟`)) return;

  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'فشل في حذف المنتج');
    }

    setMessage('تم حذف المنتج بنجاح');
    fetchProducts(); // إعادة تحميل المنتجات
  } catch (error: any) {
    console.error('Error deleting product:', error);
    setError(error.message || 'حدث خطأ أثناء حذف المنتج');
  }
};

  const handleCreate = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setFormData({
      name: '',
      description: '',
      category: ''
    });
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // التحقق من صحة البيانات
    if (!formData.name || !formData.category) {
      setError('الاسم والفئة مطلوبان');
      return;
    }

    try {
      const url = isEditing ? `/api/products/${currentProduct?.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `فشل في ${isEditing ? 'تحديث' : 'إنشاء'} المنتج`);
      }

      setMessage(`تم ${isEditing ? 'تحديث' : 'إنشاء'} المنتج بنجاح`);
      setIsFormOpen(false);
      fetchProducts(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError(error.message || `حدث خطأ أثناء ${isEditing ? 'تحديث' : 'إنشاء'} المنتج`);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const categories = [
    'مأكولات',
    'مشروبات',
    'منتجات الألبان',
    'مخبوزات',
    'لحوم',
    'أسماك',
    'فواكه',
    'خضروات',
    'منتجات مجمدة',
    'أخرى'
  ];

  if (isLoading) {
    return (
      <div className="products-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>إدارة المنتجات</h1>
        <button onClick={handleCreate} className="add-product-btn">
          إضافة منتج جديد
        </button>
      </div>

      {message && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* شريط البحث والتصفية */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="ابحث باسم المنتج أو الوصف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">جميع الفئات</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <button type="submit" className="search-btn">
            بحث
          </button>
          <button 
            type="button" 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setCurrentPage(1);
            }}
            className="reset-btn"
          >
            إعادة تعيين
          </button>
        </form>
      </div>

      {/* جدول المنتجات */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>اسم المنتج</th>
              <th>الوصف</th>
              <th>الفئة</th>
              <th>تم الإضافة بواسطة</th>
              <th>تاريخ الإضافة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td className="description-cell">
                    {product.description || 'لا يوجد وصف'}
                  </td>
                  <td>
                    <span className="category-badge">
                      {product.category}
                    </span>
                  </td>
                  <td>{product.user.name}</td>
                  <td>{new Date(product.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(product)}
                        className="edit-btn"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="delete-btn"
                        disabled={!['ADMIN', 'QUALITY_MANAGER'].includes(session?.user.role || '')}
                        title={!['ADMIN', 'QUALITY_MANAGER'].includes(session?.user.role || '') ? 
                          'ليس لديك صلاحية الحذف' : ''}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-data">
                  لا توجد منتجات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* الترقيم (Pagination) */}
      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="pagination-btn"
          >
            السابق
          </button>
          
          <span className="pagination-info">
            الصفحة {pagination.page} من {pagination.pages}
          </span>
          
          <button
            onClick={() => setCurrentPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="pagination-btn"
          >
            التالي
          </button>
        </div>
      )}

      {pagination && (
        <div className="total-count">
          إجمالي المنتجات: {pagination.total}
        </div>
      )}

      {/* نموذج إضافة/تعديل المنتج */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="name">اسم المنتج *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="أدخل اسم المنتج"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">الفئة *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">اختر الفئة</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">الوصف</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="أدخل وصفاً للمنتج (اختياري)"
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="save-btn"
                >
                  {isEditing ? 'تحديث' : 'إنشاء'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="cancel-btn"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}