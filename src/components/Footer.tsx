import { footer, mapsUrl, phoneUrl, site, whatsappUrl } from '../data/site'

// Links get at least 44px of height so they are easy to tap on a phone
const link =
  'inline-flex min-h-11 items-center underline-offset-4 transition hover:text-gold-400 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand-100'

function Heading({ children }: { children: string }) {
  return <h2 className="text-sm font-bold tracking-[0.14em] text-gold-400">{children}</h2>
}

export default function Footer() {
  const { address, hours } = site

  return (
    <footer className="bg-forest-950 text-sand-300">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-3 md:px-16">
        <div>
          <p className="font-display text-3xl text-sand-100">Recanto do Tuiuiú</p>
          <p className="mt-4 max-w-xs">{footer.tagline}</p>
          {footer.social.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-6">
              {footer.social.map((item) => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={link}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Heading>CONTATO</Heading>
          <address className="mt-4 not-italic">
            <p>
              {address.street}
              <br />
              {address.city} - {address.state}, {address.postalCode}
            </p>
            <ul className="mt-2">
              <li>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={link}>
                  Como chegar (Google Maps)
                </a>
              </li>
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={link}>
                  WhatsApp {site.phone.display}
                </a>
              </li>
              <li>
                <a href={phoneUrl} className={link}>
                  Ligar {site.phone.display}
                </a>
              </li>
            </ul>
          </address>
        </div>

        <div>
          <Heading>HORÁRIOS</Heading>
          <ul className="mt-4 space-y-2">
            <li>{hours.checkInText}</li>
            <li>{hours.checkOutText}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-sand-100/10">
        <div className="mx-auto max-w-6xl space-y-3 px-6 py-8 text-sm md:px-16">
          <p className="max-w-3xl">
            <strong className="font-bold text-sand-100">Privacidade.</strong> {footer.privacy.text}
          </p>
          <p>
            © {new Date().getFullYear()} {site.name}
            {footer.photoCredit && <> · {footer.photoCredit}</>}
          </p>
        </div>
      </div>
    </footer>
  )
}
