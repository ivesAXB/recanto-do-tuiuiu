import { lazy, Suspense, type ReactNode } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'

// These pages are only downloaded when someone opens them ("#/admin", "#/animais", "#/peixes", "#/pequenos")
const AdminApp = lazy(() => import('./admin/AdminApp'))
const Animals = lazy(() => import('./pages/Animals'))
const FishPage = lazy(() => import('./pages/FishPage'))
const Kids = lazy(() => import('./pages/Kids'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Sections of the home page. Old shared links like "site/#reservar" arrive as the route "/reservar":
// those keep opening the home page (which scrolls to the section); anything else is a 404.
const SECTIONS = ['dia', 'pousada', 'animais', 'pesca', 'epocas', 'pacotes', 'trofeus', 'reservar']

function HomeOrNotFound() {
  const { pathname } = useLocation()
  if (pathname === '/' || SECTIONS.includes(pathname.slice(1))) return <Home />
  return (
    <Lazy>
      <NotFound />
    </Lazy>
  )
}

function Lazy({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <p role="status" className="grid min-h-screen place-items-center text-sand-300">
          Carregando…
        </p>
      }
    >
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Lazy>
              <AdminApp />
            </Lazy>
          }
        />
        <Route
          path="/animais/:slug?"
          element={
            <Lazy>
              <Animals />
            </Lazy>
          }
        />
        <Route
          path="/peixes/:slug?"
          element={
            <Lazy>
              <FishPage />
            </Lazy>
          }
        />
        <Route
          path="/pequenos"
          element={
            <Lazy>
              <Kids />
            </Lazy>
          }
        />
        {/* "*" also catches old in-page links ("#reservar" becomes "/reservar") without remounting the page */}
        <Route path="*" element={<HomeOrNotFound />} />
      </Routes>
    </HashRouter>
  )
}
