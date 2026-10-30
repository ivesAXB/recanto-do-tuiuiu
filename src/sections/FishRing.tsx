import PhotoRing from '../components/PhotoRing'
import { fish } from '../data/fish'

// Only 3 species for now: the ring repeats them to fill its 6 places
export default function FishRing() {
  return (
    <PhotoRing
      id="peixes"
      label="PEIXES"
      title="Os peixes da pesca esportiva."
      items={fish}
      basePath="/peixes"
      ctaText="Ver os peixes"
    />
  )
}
