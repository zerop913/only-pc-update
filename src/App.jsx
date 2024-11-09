import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ROUTES } from "./routes/routes";
import Configurator from "./pages/Configurator";
import ProductPage from "./pages/ProductPage";
import AuthPage from "./pages/AuthPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import { ProfileStateProvider } from "./components/Profile/ProfileStateContext";

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-[#0A0B14]">
          <main>
            <Routes>
              <Route path={ROUTES.HOME} element={<Configurator />} />
              <Route path={ROUTES.CATEGORY} element={<Configurator />} />
              <Route path={ROUTES.SUBCATEGORY} element={<Configurator />} />
              <Route path={ROUTES.PRODUCT} element={<ProductPage />} />
              <Route path={ROUTES.PRODUCT_CHILD} element={<ProductPage />} />
              <Route path={ROUTES.AUTH} element={<AuthPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              <Route
                path={ROUTES.PROFILE}
                element={
                  <ProfileStateProvider>
                    <ProfilePage />
                  </ProfileStateProvider>
                }
              />
              <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
