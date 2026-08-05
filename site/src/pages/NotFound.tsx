import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <>
      <h1>Not found</h1>
      <p>
        That page doesn't exist yet. <Link to="/journey">Back to the journey</Link>.
      </p>
    </>
  );
}
