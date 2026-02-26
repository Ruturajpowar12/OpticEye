import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const emptyForm = {
  title: "",
  description: "",
  brand: "",
  category: "",
  price: "",
  salePrice: "",
  frameType: "Full Rim",
  gender: "Unisex",
  lensType: "Single Vision",
  color: "Black",
  material: "Acetate",
  stock: "0",
  images: "",
  featured: false,
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [drafts, setDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products", { params: { limit: 200, sort: "newest" } }),
        api.get("/categories"),
      ]);

      const nextProducts = productsRes.data.products || [];
      const nextDrafts = {};
      nextProducts.forEach((product) => {
        nextDrafts[product._id] = {
          price: String(product.price),
          salePrice: product.salePrice ? String(product.salePrice) : "",
          stock: String(product.stock),
        };
      });

      setProducts(nextProducts);
      setDrafts(nextDrafts);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        stock: Number(form.stock),
        images: form.images
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean),
      };

      await api.post("/products", payload);
      setForm(emptyForm);
      setMessage("Product created successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((item) => item._id !== productId));
      setMessage("Product removed.");
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleDraftChange = (productId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSaveDraft = async (product) => {
    const draft = drafts[product._id];
    if (!draft) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const payload = {
        price: Number(draft.price),
        salePrice: draft.salePrice ? Number(draft.salePrice) : null,
        stock: Number(draft.stock),
      };

      const { data } = await api.put(`/products/${product._id}`, payload);
      setProducts((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      setDrafts((prev) => ({
        ...prev,
        [data._id]: {
          price: String(data.price),
          salePrice: data.salePrice ? String(data.salePrice) : "",
          stock: String(data.stock),
        },
      }));
      setMessage(`Updated ${data.title}`);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const { data } = await api.put(`/products/${product._id}`, {
        featured: !product.featured,
      });
      setProducts((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      setMessage(`Featured state updated for ${data.title}`);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query)
    );
  }, [products, search]);

  return (
    <section className="stack-gap">
      <header>
        <h1>Products</h1>
        <p>Create and manage eyeglasses and sunglasses inventory.</p>
      </header>

      <form className="panel form-grid" onSubmit={handleCreate}>
        <h3>Add Product</h3>
        <div className="grid-3">
          <input
            className="admin-input"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <input
            className="admin-input"
            placeholder="Brand"
            value={form.brand}
            onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
            required
          />
          <select
            className="admin-input"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          className="admin-input"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          required
        />

        <div className="grid-4">
          <input
            className="admin-input"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            required
          />
          <input
            className="admin-input"
            type="number"
            placeholder="Sale Price"
            value={form.salePrice}
            onChange={(e) => setForm((prev) => ({ ...prev, salePrice: e.target.value }))}
          />
          <input
            className="admin-input"
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            required
          />
          <input
            className="admin-input"
            placeholder="Color"
            value={form.color}
            onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
          />
        </div>

        <div className="grid-4">
          <select
            className="admin-input"
            value={form.frameType}
            onChange={(e) => setForm((prev) => ({ ...prev, frameType: e.target.value }))}
          >
            <option>Full Rim</option>
            <option>Half Rim</option>
            <option>Rimless</option>
            <option>Round</option>
            <option>Cat Eye</option>
            <option>Aviator</option>
            <option>Wayfarer</option>
          </select>
          <select
            className="admin-input"
            value={form.gender}
            onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
          >
            <option>Men</option>
            <option>Women</option>
            <option>Unisex</option>
            <option>Kids</option>
          </select>
          <select
            className="admin-input"
            value={form.lensType}
            onChange={(e) => setForm((prev) => ({ ...prev, lensType: e.target.value }))}
          >
            <option>Single Vision</option>
            <option>Progressive</option>
            <option>Blue Light</option>
            <option>Polarized</option>
            <option>Zero Power</option>
          </select>
          <input
            className="admin-input"
            placeholder="Material"
            value={form.material}
            onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))}
          />
        </div>

        <input
          className="admin-input"
          placeholder="Image URLs (comma separated)"
          value={form.images}
          onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))}
        />

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
          />
          Mark as featured
        </label>

        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}

        <button type="submit" className="admin-btn" disabled={submitting}>
          {submitting ? "Saving..." : "Create Product"}
        </button>
      </form>

      <article className="panel">
        <div className="table-header-row">
          <h3>Product List</h3>
          <input
            className="admin-input search-input"
            placeholder="Search product or brand"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? <p>Loading products...</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Sale</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <strong>{product.title}</strong>
                    <p className="muted-text">{product.brand}</p>
                  </td>
                  <td>{product.category?.name || "NA"}</td>
                  <td>
                    <input
                      className="admin-input compact-input"
                      type="number"
                      min="1"
                      value={drafts[product._id]?.price ?? ""}
                      onChange={(e) => handleDraftChange(product._id, "price", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input compact-input"
                      type="number"
                      min="0"
                      value={drafts[product._id]?.salePrice ?? ""}
                      onChange={(e) => handleDraftChange(product._id, "salePrice", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input compact-input"
                      type="number"
                      min="0"
                      value={drafts[product._id]?.stock ?? ""}
                      onChange={(e) => handleDraftChange(product._id, "stock", e.target.value)}
                    />
                  </td>
                  <td>{product.featured ? "Yes" : "No"}</td>
                  <td>
                    <div className="action-row">
                      <button
                        type="button"
                        className="small-btn"
                        onClick={() => handleSaveDraft(product)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="small-btn"
                        onClick={() => handleToggleFeatured(product)}
                      >
                        Toggle Featured
                      </button>
                      <button
                        type="button"
                        className="small-btn danger"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default ProductsPage;
