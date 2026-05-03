import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <section className="section container notfound-wrap page">
    <div className="notfound-card">
      <p className="eyebrow">404</p>
      <h2>Page not found</h2>
      <p>The page you are looking for is unavailable or still under development.</p>
      <Link className="primary-btn small" to="/">
        Back to Home
      </Link>
    </div>
  </section>
);

export default NotFoundPage;
