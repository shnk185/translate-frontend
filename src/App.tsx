import { useState } from 'react'
import { translate } from './api'
import type { TranslateResult } from './api'

export default function App() {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState<TranslateResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleTranslate() {
        setLoading(true)
        setError('')
        try {
            setResult(await translate({query, source_lang: 'English', dest_lang: 'Vietnamese (Northern)', preset: 1}))
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Request failed')
        } finally {
            setLoading(false)
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
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </main>
    )
}

