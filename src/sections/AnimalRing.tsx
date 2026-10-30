import PhotoRing from '../components/PhotoRing'
import { animals } from '../data/animals'

export default function AnimalRing() {
  return (
    <PhotoRing
      id="animais"
      label="FAUNA"
      title="Quem mora por aqui."
      items={animals}
      basePath="/animais"
      ctaText="Ver os animais"
    />
  )
}
