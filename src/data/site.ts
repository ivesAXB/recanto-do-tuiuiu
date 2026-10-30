// Confirmed public facts about the pousada (confirmed by Ives on 2026-10-29).
// Single source for the footer, contact texts and the JSON-LD built in vite.config.ts.
// Prices and defeso dates are NOT here: they live in the database (admin panel).

export const site = {
  name: 'Pousada Recanto do Tuiuiú',
  description:
    'Pousada no Pantanal mato-grossense com pesca esportiva, ecoturismo e hospedagem com café, almoço e janta inclusos.',
  maxGuests: 18,

  address: {
    street: 'Rio Mutum com Baía Siá Mariana, Zona Rural',
    city: 'Barão de Melgaço',
    state: 'MT',
    postalCode: '78190-000',
    country: 'BR',
  },

  // Public phone, also the WhatsApp number shown on the site
  phone: {
    display: '(65) 99971-3778',
    e164: '+5565999713778',
  },

  // Cuiabá is UTC-4 all year (no daylight saving), one hour behind Brasília
  hours: {
    timeZone: 'America/Cuiaba',
    utcOffset: '-04:00',
    checkIn: '05:00',
    checkOut: '18:00',
    checkInText: 'Check-in a partir das 05h (horário de Cuiabá, 06h em Brasília)',
    checkOutText: 'Check-out até as 18h (horário de Cuiabá, 19h em Brasília)',
  },
} as const

export const fullAddress = `${site.address.street}, ${site.address.city} - ${site.address.state}, ${site.address.postalCode}`

// Google Maps search for the confirmed address (no invented coordinates)
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
