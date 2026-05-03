import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", image: "", description: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/categories");
      const nextDrafts = {};
      data.forEach((category) => {
        nextDrafts[category._id] = {
          name: category.name,
          image: category.image || "",
          description: category.description || "",
        };
      });
      setCategories(data);
      setDrafts(nextDrafts);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/categories", form);
      setForm({ name: "", image: "", description: "" });
      setMessage("Category created successfully.");
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleDraftChange = (categoryId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value,
      },
    }));
  };

  const handleSaveCategory = async (categoryId) => {
    const draft = drafts[categoryId];
    if (!draft) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const { data } = await api.put(`/categories/${categoryId}`, draft);
      setCategories((prev) => prev.map((item) => (item._id === categoryId ? data : item)));
      setDrafts((prev) => ({
        ...prev,
        [categoryId]: {
          name: data.name,
          image: data.image || "",
          description: data.description || "",
        },
      }));
      setMessage(`Updated ${data.name}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      await api.delete(`/categories/${categoryId}`);
      setCategories((prev) => prev.filter((item) => item._id !== categoryId));
      setMessage("Category removed.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return categories;
    }

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query)
    );
  }, [categories, search]);

  return (
    <section className="stack-gap page">
      <header>
        <h1>Categories</h1>
        <p>Manage eyewear category rails used in storefront navigation.</p>
      </header>

      <form className="panel form-grid" onSubmit={handleCreate}>
        <h3>Add Category</h3>
        <div className="grid-3">
          <input
            className="admin-input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="admin-input"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}

        <button type="submit" className="admin-btn">
          Add Category
        </button>
      </form>

      <article className="panel">
        <div className="table-header-row">
          <h3>Category List</h3>
          <input
            className="admin-input search-input"
            placeholder="Search categories"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? <p>Loading...</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Image URL</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <input
                      className="admin-input compact-input"
                      value={drafts[category._id]?.name ?? ""}
                      onChange={(e) => handleDraftChange(category._id, "name", e.target.value)}
                    />
                  </td>
                  <td>{category.slug}</td>
                  <td>
                    <input
                      className="admin-input compact-input"
                      value={drafts[category._id]?.image ?? ""}
                      onChange={(e) => handleDraftChange(category._id, "image", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input compact-input"
                      value={drafts[category._id]?.description ?? ""}
                      onChange={(e) =>
                        handleDraftChange(category._id, "description", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <div className="action-row">
                      <button
                        type="button"
                        className="small-btn"
                        onClick={() => handleSaveCategory(category._id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="small-btn danger"
                        onClick={() => handleDelete(category._id)}
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

export default CategoriesPage;
