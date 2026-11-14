export type WordItem = { chunk: string; meaning: string; id: number; known: boolean}
export type TranslateResult = { id: number; translation: string; words: WordItem[] }
export type TranslateRequest = { query: string; source_lang: string; dest_lang: string; preset: number }
export type ChunkStatus = { id: number; status: boolean }
export type Preset = { id: number; name: string }

export async function getPresets(): Promise<Preset[]> {
    const res = await fetch('/api/presets')
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
    return (await res.json()).presets
}

export async function getLanguages(): Promise<string[]> {
    const res = await fetch('/api/languages')
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
    return (await res.json()).languages
}

export async function translate(body: TranslateRequest): Promise<TranslateResult> {
    const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
    return res.json()
}

export async function saveKnown(chunks: ChunkStatus[]): Promise<void> {
    const res = await fetch('/api/chunks/known', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({chunks}),
    })
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
}