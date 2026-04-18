import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section>
      <h1>404</h1>
      <p>Page not found.</p>
      <p>
        <Link to="/">Home</Link>
      </p>
    </section>
  );
}
