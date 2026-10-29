import { useEffect, useState, type FormEvent } from 'react'
import { friendlyError, StaleError } from './errors'
import { centsToInput, formatBRL, loadSettings, parseBRL, saveSetting, type SettingKey } from './values'
import { errorText, inputClass, primaryButton } from './ui'

type Settings = Partial<Record<SettingKey, unknown>>
type FormErrors = Partial<Record<'lodging' | 'deposit', string>>

export default function SettingsEditor() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [lodging, setLodging] = useState('')
  const [deposit, setDeposit] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
      .then((s) => {
        setSettings(s)
        const cents = Number(s.diaria_hospedagem_cents)
        setLodging(Number.isFinite(cents) ? centsToInput(cents) : '')
        setDeposit(s.sinal_percentual != null ? String(Number(s.sinal_percentual)) : '')
      })
      .catch((err) => setLoadError(friendlyError(err, 'Não foi possível carregar as configurações.')))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!settings) return
    const e: FormErrors = {}
    const cents = parseBRL(lodging)
    if (cents === null || cents <= 0) e.lodging = 'Informe a diária em reais. Ex.: 300 ou 300,00.'
    const percent = Number(deposit)
    if (!deposit.trim() || !Number.isInteger(percent) || percent < 0 || percent > 100)
      e.deposit = 'Use um número inteiro de 0 a 100.'
    setErrors(e)
    if (e.lodging || e.deposit) {
      document.getElementById(e.lodging ? 'setting-lodging' : 'setting-deposit')?.focus()
      return
    }

    setSaving(true)
    setNotice(null)
    setSaveError(null)
    try {
      // Only send what changed
      const next = { ...settings }
      if (cents !== Number(settings.diaria_hospedagem_cents))
        next.diaria_hospedagem_cents = await saveSetting('diaria_hospedagem_cents', cents!, settings.diaria_hospedagem_cents)
      if (percent !== Number(settings.sinal_percentual))
        next.sinal_percentual = await saveSetting('sinal_percentual', percent, settings.sinal_percentual)
      setSettings(next)
      setNotice('Salvo. O site mostra os novos valores na próxima visita.')
    } catch (err) {
      setSaveError(
        err instanceof StaleError ? 'Configuração não encontrada no banco. Fale com o desenvolvedor.' : friendlyError(err),
      )
    } finally {
      setSaving(false)
    }
  }

  const capacity = Number(settings?.capacidade_maxima)

  return (
    <section aria-labelledby="settings-title">
      <h2 id="settings-title" className="font-display text-3xl">
        Hospedagem e sinal
      </h2>

      <div aria-live="polite" className="mt-4 space-y-3">
        {!settings && !loadError && <p className="text-sand-300">Carregando configurações…</p>}
        {loadError && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{loadError}</p>}
        {notice && <p className="rounded-2xl bg-[#2F7A52]/40 p-4 font-bold">{notice}</p>}
        {saveError && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{saveError}</p>}
      </div>

      {settings && (
        <form onSubmit={handleSubmit} noValidate className="mt-4 rounded-3xl bg-forest-800 p-6 md:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="setting-lodging" className="block font-bold">
                Diária da hospedagem (R$ por pessoa)
              </label>
              <input
                id="setting-lodging"
                type="text"
                inputMode="decimal"
                value={lodging}
                onChange={(e) => {
                  setLodging(e.target.value)
                  setNotice(null)
                }}
                aria-invalid={!!errors.lodging}
                aria-describedby={errors.lodging ? 'setting-lodging-error' : undefined}
                className={inputClass}
              />
              {errors.lodging && (
                <p id="setting-lodging-error" className={errorText}>
                  {errors.lodging}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="setting-deposit" className="block font-bold">
                Sinal para confirmar (% da hospedagem)
              </label>
              <input
                id="setting-deposit"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={deposit}
                onChange={(e) => {
                  setDeposit(e.target.value)
                  setNotice(null)
                }}
                aria-invalid={!!errors.deposit}
                aria-describedby={errors.deposit ? 'setting-deposit-error' : undefined}
                className={inputClass}
              />
              {errors.deposit && (
                <p id="setting-deposit-error" className={errorText}>
                  {errors.deposit}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-forest-950/60 p-5">
            <p className="font-bold">Capacidade máxima: {Number.isFinite(capacity) ? `${capacity} pessoas` : '18 pessoas'}</p>
            <p className="mt-1 text-sm text-sand-300">
              O limite de 18 pessoas está fixo no formulário e no banco. Para mudar, é preciso uma migração.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={saving} className={primaryButton}>
              {saving ? 'Salvando…' : 'Salvar valores'}
            </button>
          </div>

          {Number.isFinite(Number(settings.diaria_hospedagem_cents)) && (
            <p className="mt-4 text-sm text-sand-300">
              Valor atual no site: {formatBRL(Number(settings.diaria_hospedagem_cents))} por pessoa/dia, sinal de{' '}
              {Number(settings.sinal_percentual)}%.
            </p>
          )}
        </form>
      )}
    </section>
  )
}
