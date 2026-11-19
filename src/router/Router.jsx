import { lazy } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import DestinationsPage from "../pages/DestinationsPage";
import DestinationDetailsPage from "../pages/DestinationDetailsPage";
import SearchPage from "../pages/SearchPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import RegionPage from "../pages/RegionPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import TravelersPage from "../pages/TravelersPage";
import TravelerPage from "../pages/TravelerPage";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import NotFoundPage from "../pages/NotFoundPage";

// Pages chargées à la demande (React.lazy) : un visiteur qui ne se connecte pas
// ne télécharge ni le profil ni l'administration
const ProfileLayout = lazy(() => import("../layouts/ProfileLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const AdminCommentsPage = lazy(() => import("../pages/admin/AdminCommentsPage"));
const AdminDestinationNewPage = lazy(() => import("../pages/admin/AdminDestinationNewPage"));
const AdminDestinationsPage = lazy(() => import("../pages/admin/AdminDestinationsPage"));
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminContactsPage = lazy(() => import("../pages/admin/AdminContactsPage"));
const AdminHomePage = lazy(() => import("../pages/admin/AdminHomePage"));
const ProfileCommentsPage = lazy(() => import("../pages/ProfileCommentsPage"));
const ProfileFavoritesPage = lazy(() => import("../pages/ProfileFavoritesPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));

function Router() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:slug" element={<DestinationDetailsPage />} />
          <Route path="/region/:region" element={<RegionPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/voyageurs" element={<TravelersPage />} />
          <Route path="/voyageurs/:username" element={<TravelerPage />} />

          {/* Routes accessibles seulement si l'utilisateur est connecté */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path="favorites" element={<ProfileFavoritesPage />} />
              <Route path="comments" element={<ProfileCommentsPage />} />
            </Route>
            {/* ancienne adresse des favoris */}
            <Route path="/favorites" element={<Navigate to="/profile/favorites" replace />} />
          </Route>

          {/* Routes réservées au rôle "admin" */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHomePage />} />
              <Route path="contacts" element={<AdminContactsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="destinations" element={<AdminDestinationsPage />} />
              <Route path="destinations/new" element={<AdminDestinationNewPage />} />
              <Route path="comments" element={<AdminCommentsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
