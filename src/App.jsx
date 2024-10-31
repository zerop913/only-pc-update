import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Configurator from "./pages/Configurator";
import ProductPage from "./pages/ProductPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-[#0A0B14]">
          <main>
            <Routes>
              <Route path="/" element={<Configurator />} />
              <Route path="/:categoryShortName" element={<Configurator />} />
              <Route
                path="/:categoryShortName/:subcategoryShortName"
                element={<Configurator />}
              />
              <Route
                path="/products/:categories/:slug"
                element={<ProductPage />}
              />
              <Route
                path="/products/:categories/:childCategories/:slug"
                element={<ProductPage />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
