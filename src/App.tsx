import { useState } from 'react'
import { saveKnown, translate } from './api'
import type { TranslateResult } from './api'

export default function App() {
    const [query, setQuery] = useState('')
    const [preset, setPreset] = useState(1)
    const [result, setResult] = useState<TranslateResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [unknown, setUnknown] = useState<Set<number>>(new Set())
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    async function handleTranslate() {
        setLoading(true)
        setError('')
        setSaved(false)
        setUnknown(new Set())
        try {
            setResult(await translate({query, source_lang: 'English', dest_lang: 'Vietnamese (Northern)', preset }))
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Request failed')
        } finally {
            setLoading(false)
        }
    }

    function toggle(id: number) {
        setUnknown(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
        setSaved(false)
    }

    async function handleSave() {
        if (!result) return
        setSaving(true)
        setError('')
        try {
            await saveKnown(result.words.map(w => ({ id: w.id, status: !unknown.has(w.id) })))
            setSaved(true)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    return (
        <main>
            <textarea value={query} onChange={e => setQuery(e.target.value)}></textarea>
            <button onClick={handleTranslate} disabled={loading || !query}>
                {loading ? 'Translating...' : 'Translate'}
            </button>
            {error && <p role="alert">{error}</p>}
            {result && (
                <>
                    <h2>{result.translation}</h2>
                    <ul>
                        {result.words.map((w) => (
                            <li key={w.id}>
                                <strong>{w.chunk}</strong> - {w.meaning} <em>{w.known ? 'known' : 'new'}</em>
                                <button onClick={() => toggle(w.id)} aria-pressed={unknown.has(w.id)}>
                                    {unknown.has(w.id) ? "Didn't know" : 'Knew it'}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    {saved && <p>Saved</p>}
                </>
            )}
        </main>
    )
}

