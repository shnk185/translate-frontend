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
            setResult(await translate({query, source_lang: 'Vietnamese (Northern)', dest_lang: 'English', preset }))
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
        <main className="mx-auto max-w-2xl space-y-6 p-6">
            <div className="space-y-3">
            <textarea className="h-28 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      value={query} onChange={e => setQuery(e.target.value)}></textarea>
            <button
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={handleTranslate} disabled={loading || !query}>
                {loading ? 'Translating...' : 'Translate'}
            </button>
            </div>
            {error && (<p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>)}
            {result && (
                <section className="space-y-4">
                    <p className="text-lg">{result.translation}</p>
                    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                        {result.words.map((w) => (
                            <li key={w.id} className="flex items-center justify-between gap-3 p-3">
                                <strong>{w.chunk}</strong> - <span className="text-gray-500">{w.meaning}</span> <em>{w.known ? 'known' : 'new'}</em>
                                <button onClick={() => toggle(w.id)} aria-pressed={unknown.has(w.id)}
                                        className={
                                          unknown.has(w.id)
                                              ? 'rounded-full bg-red-100 px-3 py-1 text-sm text-red-700'
                                              : 'rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600'
                                      } >
                                    {unknown.has(w.id) ? "Didn't know" : 'Knew it'}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSave} disabled={saving} className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    {saved && <p className="text-sm text-green-700">Saved</p>}
                </section>
            )}
        </main>
    )
}

