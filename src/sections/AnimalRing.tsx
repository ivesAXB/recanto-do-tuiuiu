import PhotoWheel from '../components/PhotoWheel'
import { animals } from '../data/animals'

// Only the animals marked "destaque" (6) go in the wheel; the catalog shows all of them
const wheelItems = animals
  .filter((a) => a.destaque)
  .map((a) => ({ slug: a.slug, nome: a.nome, foto: a.fotos[0]?.nome ?? null }))

export default function AnimalRing() {
  return (
    <PhotoWheel
      id="animais"
      label="FAUNA"
      title="Quem mora por aqui."
      items={wheelItems}
      basePath="/animais"
      ctaText="Ver os animais"
      autoPlay
    />
  )
}
