import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";

const defaultFilters = {
  search: "",
  category: "",
  frameType: "",
  gender: "",
  sort: "newest",
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    ...defaultFilters,
    search: searchParams.get("search") || defaultFilters.search,
    category: searchParams.get("category") || defaultFilters.category,
    frameType: searchParams.get("frameType") || defaultFilters.frameType,
    gender: searchParams.get("gender") || defaultFilters.gender,
    sort: searchParams.get("sort") || defaultFilters.sort,
  });

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    setSearchParams(params);

    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/products", { params: filters });
        setProducts(data.products || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters, setSearchParams]);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.slug, label: category.name })),
    [categories]
  );

  return (
    <section className="section container">
      <div className="section-head">
        <h2>Shop Eyewear</h2>
        <button type="button" className="outline-btn small-btn-lite" onClick={() => setFilters(defaultFilters)}>
          Reset Filters
        </button>
      </div>

      <div className="filters-grid">
        <input
          className="input"
          placeholder="Search by product, brand, color"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />

        <select
          className="input"
          value={filters.category}
          onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={filters.frameType}
          onChange={(e) => setFilters((prev) => ({ ...prev, frameType: e.target.value }))}
        >
          <option value="">All Frame Types</option>
          <option value="Full Rim">Full Rim</option>
          <option value="Half Rim">Half Rim</option>
          <option value="Rimless">Rimless</option>
          <option value="Round">Round</option>
          <option value="Cat Eye">Cat Eye</option>
          <option value="Aviator">Aviator</option>
          <option value="Wayfarer">Wayfarer</option>
        </select>

        <select
          className="input"
          value={filters.gender}
          onChange={(e) => setFilters((prev) => ({ ...prev, gender: e.target.value }))}
        >
          <option value="">All Gender</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Unisex">Unisex</option>
          <option value="Kids">Kids</option>
        </select>

        <select
          className="input"
          value={filters.sort}
          onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Top Rated</option>
        </select>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading products...</p> : null}

      {!loading && !products.length ? <p>No products match your filters.</p> : null}
      {!loading && products.length ? <p className="muted-text">{products.length} product(s) found.</p> : null}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ShopPage;
