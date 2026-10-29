import ExperiencesEditor from './ExperiencesEditor'
import SettingsEditor from './SettingsEditor'

export default function ValuesPanel() {
  return (
    <div className="space-y-16">
      <SettingsEditor />
      <ExperiencesEditor />
    </div>
  )
}
