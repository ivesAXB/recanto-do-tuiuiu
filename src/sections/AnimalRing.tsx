import PhotoRing from '../components/PhotoRing'
import { animals } from '../data/animals'

// Only the animals marked "destaque" (6) go in the ring; the catalog shows all of them
const ringItems = animals
  .filter((a) => a.destaque)
  .map((a) => ({ slug: a.slug, nome: a.nome, foto: a.fotos[0]?.nome ?? null }))

export default function AnimalRing() {
  return (
    <PhotoRing
      id="animais"
      label="FAUNA"
      title="Quem mora por aqui."
      items={ringItems}
      basePath="/animais"
      ctaText="Ver os animais"
    />
  )
}
