import { useEffect, useRef } from 'react'

/* Windows XP style building blocks. Styles live in index.css (.xp-*). */

/** A window with a blue title bar. `draggable` lets visitors move it by the title bar (mouse or finger). */
export function XpWindow({ title, children, onClose, onMinimize, draggable = false, className = '', bodyClassName = '', titleId, style, as: Tag = 'section', ...rest }) {
  const win = useRef(), pos = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (!draggable) return
    const el = win.current, bar = el?.querySelector('.xp-titlebar')
    if (!bar) return
    let start = null
    const down = (e) => {
      if (e.target.closest('button')) return
      start = { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y, id: e.pointerId }
      try { bar.setPointerCapture(e.pointerId) } catch { /* old browsers */ }
    }
    const move = (e) => {
      if (!start || e.pointerId !== start.id) return
      // keep at least part of the title bar on screen
      const r = el.getBoundingClientRect()
      const nx = e.clientX - start.x, ny = e.clientY - start.y
      const maxX = window.innerWidth - 80 - (r.left - pos.current.x), minX = 80 - r.width - (r.left - pos.current.x)
      const maxY = window.innerHeight - 40 - (r.top - pos.current.y), minY = -(r.top - pos.current.y)
      pos.current = { x: Math.min(maxX, Math.max(minX, nx)), y: Math.min(maxY, Math.max(minY, ny)) }
      el.style.translate = `${pos.current.x}px ${pos.current.y}px`
    }
    const up = () => { start = null }
    bar.addEventListener('pointerdown', down)
    bar.addEventListener('pointermove', move)
    bar.addEventListener('pointerup', up)
    bar.addEventListener('pointercancel', up)
    return () => { bar.removeEventListener('pointerdown', down); bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up) }
  }, [draggable])

  return (
    <Tag ref={win} className={`xp-window ${className}`} style={style} aria-labelledby={titleId} {...rest}>
      <div className={`xp-titlebar ${draggable ? 'cursor-move touch-none' : ''}`}>
        <span id={titleId} className="xp-title">{title}</span>
        <span className="xp-controls">
          {onMinimize && <button type="button" className="xp-ctl xp-min" aria-label="Minimise" onClick={onMinimize} />}
          {onClose && <button type="button" className="xp-ctl xp-close" aria-label="Close" onClick={onClose} />}
          {!onClose && !onMinimize && <><span className="xp-ctl xp-min" aria-hidden="true" /><span className="xp-ctl xp-max" aria-hidden="true" /><span className="xp-ctl xp-close" aria-hidden="true" /></>}
        </span>
      </div>
      <div className={`xp-body ${bodyClassName}`}>{children}</div>
    </Tag>
  )
}

/** Classic blue-segment progress bar. value 0..1 */
export function XpProgress({ value, label }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div className="xp-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <div className="xp-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
