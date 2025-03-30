import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import "./index.css";
import App from "./App.jsx";
import StarRating from "./StarRating";

function Test() {
  const [movieRating, setMovieRating] = useState(0);

  return (
    <div>
      <StarRating color="blue" maxRating={10} onSetRating={setMovieRating} />
      <p>この映画は星{movieRating}個です</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    {/* <StarRating maxRating={5} messages={["a", "b", "c", "d", "e"]} />
    <StarRating size={24} color="red" className="test" defaultRating={3} />
    <Test /> */}
  </StrictMode>
);
