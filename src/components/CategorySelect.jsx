import { useState } from 'react'
import { WORD_CATEGORIES, SIGHT_WORDS } from '../data/sightWords'
import './CategorySelect.css'

export default function CategorySelect({ onSelect, onBack }) {
  const [selected, setSelected] = useState(new Set())

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === WORD_CATEGORIES.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(WORD_CATEGORIES.map(c => c.id)))
    }
  }

  const totalWords = SIGHT_WORDS.filter(w => selected.has(w.category)).length

  const handleNext = () => {
    if (selected.size === 0) return
    const words = SIGHT_WORDS.filter(w => selected.has(w.category))
    onSelect(words)
  }

  return (
    <div className="cat-screen">
      <button className="back-btn" onClick={onBack}>← もどる</button>

      <div className="cat-heading-wrap">
        <h2 className="cat-heading">カテゴリを えらんでね！</h2>
        <p className="cat-sub">すこしずつ れんしゅう しよう</p>
      </div>

      <div className="cat-controls">
        <button
          className={`cat-all-btn ${selected.size === WORD_CATEGORIES.length ? 'active' : ''}`}
          onClick={selectAll}
        >
          {selected.size === WORD_CATEGORIES.length ? '✅ ぜんぶ はずす' : '📋 ぜんぶ えらぶ'}
        </button>
        {selected.size > 0 && (
          <span className="cat-count-badge">{totalWords} もじ</span>
        )}
      </div>

      <div className="cat-grid">
        {WORD_CATEGORIES.map((cat, i) => (
          <button
            key={cat.id}
            className={`cat-btn ${selected.has(cat.id) ? 'selected' : ''}`}
            style={{
              '--cat-color': cat.color,
              animationDelay: `${i * 0.03}s`,
            }}
            onClick={() => toggle(cat.id)}
          >
            <span className="cat-emoji">{cat.emoji}</span>
            <span className="cat-label">{cat.label}</span>
            <span className="cat-word-count">{cat.count}語</span>
            {selected.has(cat.id) && <span className="cat-check">✓</span>}
          </button>
        ))}
      </div>

      <button
        className={`cat-next-btn ${selected.size === 0 ? 'disabled' : ''}`}
        onClick={handleNext}
        disabled={selected.size === 0}
      >
        {selected.size === 0
          ? 'カテゴリを えらんでね'
          : `🎮 つぎへ（${selected.size}カテゴリ / ${totalWords}語）`}
      </button>
    </div>
  )
}
