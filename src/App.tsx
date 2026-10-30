import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'

// The admin panel is only downloaded when someone opens "#/admin"
const AdminApp = lazy(() => import('./admin/AdminApp'))
const Animals = lazy(() => import('./pages/Animals'))

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense
              fallback={
                <p role="status" className="grid min-h-screen place-items-center text-sand-300">
                  Carregando…
                </p>
              }
            >
              <AdminApp />
            </Suspense>
          }
        />
        <Route
          path="/animais/:slug?"
          element={
            <Suspense fallback={<p role="status" className="grid min-h-screen place-items-center text-sand-300">Carregando…</p>}>
              <Animals />
            </Suspense>
          }
        />
        {/* "*" also catches old in-page links ("#reservar" becomes "/reservar") without remounting the page */}
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}
