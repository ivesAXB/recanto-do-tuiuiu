import { lazy, Suspense, type ReactNode } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'

// These pages are only downloaded when someone opens them ("#/admin", "#/animais", "#/peixes")
const AdminApp = lazy(() => import('./admin/AdminApp'))
const Animals = lazy(() => import('./pages/Animals'))
const FishPage = lazy(() => import('./pages/FishPage'))

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
        {/* "*" also catches old in-page links ("#reservar" becomes "/reservar") without remounting the page */}
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}
