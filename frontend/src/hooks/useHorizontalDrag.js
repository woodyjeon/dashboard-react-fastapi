import { useCallback, useRef, useState } from 'react'

const MOVE_THRESHOLD = 6

/** Click + drag horizontal scroll for overflow containers. */
export function useDragScroll({ onDragStart, onDragEnd, disabled = false } = {}) {
  const ref = useRef(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })
  const [isDragging, setIsDragging] = useState(false)

  const finish = useCallback(
    (pointerId, el) => {
      if (!drag.current.active) return
      const moved = drag.current.moved
      drag.current.active = false
      setIsDragging(false)
      if (drag.current.captured && el?.hasPointerCapture?.(pointerId)) {
        el.releasePointerCapture(pointerId)
      }
      drag.current.captured = false
      onDragEnd?.(moved)
    },
    [onDragEnd],
  )

  const onPointerDown = useCallback(
    (e) => {
      const el = ref.current
      if (!el || disabled || e.button !== 0) return

      // Don't capture the pointer yet: capturing on pointerdown makes the
      // browser retarget the following `click` to this container, which
      // swallows clicks on links/buttons inside. Capture only once a real
      // drag begins (see onPointerMove).
      drag.current = {
        active: true,
        startX: e.clientX,
        scrollLeft: el.scrollLeft,
        moved: false,
        captured: false,
      }
      onDragStart?.()
    },
    [disabled, onDragStart],
  )

  const onPointerMove = useCallback((e) => {
    if (!drag.current.active) return
    const el = ref.current
    if (!el) return

    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > MOVE_THRESHOLD) drag.current.moved = true
    if (!drag.current.moved) return

    if (!drag.current.captured) {
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        // ignore: pointer may already be gone
      }
      drag.current.captured = true
      setIsDragging(true)
    }

    e.preventDefault()
    el.scrollLeft = drag.current.scrollLeft - dx
  }, [])

  const onPointerUp = useCallback(
    (e) => finish(e.pointerId, ref.current),
    [finish],
  )

  const onPointerCancel = useCallback(
    (e) => finish(e.pointerId, ref.current),
    [finish],
  )

  const onClickCapture = useCallback((e) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }, [])

  return {
    ref,
    isDragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
    },
  }
}

/** Click + drag swipe for index-based carousels. */
export function useDragSwipe(onSwipe, { threshold = 48, disabled = false } = {}) {
  const drag = useRef({ active: false, startX: 0, lastX: 0, moved: false, captured: false })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const finish = useCallback(
    (pointerId, el) => {
      if (!drag.current.active) return
      const dx = drag.current.lastX - drag.current.startX
      const moved = drag.current.moved
      drag.current.active = false
      setIsDragging(false)
      setDragOffset(0)

      if (drag.current.captured && el?.hasPointerCapture?.(pointerId)) {
        el.releasePointerCapture(pointerId)
      }
      drag.current.captured = false

      if (moved) {
        if (dx <= -threshold) onSwipe(1)
        else if (dx >= threshold) onSwipe(-1)
      }
      drag.current.moved = false
    },
    [onSwipe, threshold],
  )

  const onPointerDown = useCallback(
    (e) => {
      if (disabled || e.button !== 0) return
      drag.current = {
        active: true,
        startX: e.clientX,
        lastX: e.clientX,
        moved: false,
        captured: false,
      }
      setDragOffset(0)
    },
    [disabled],
  )

  const onPointerMove = useCallback((e) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    drag.current.lastX = e.clientX
    if (Math.abs(dx) <= MOVE_THRESHOLD) return

    if (!drag.current.moved) {
      drag.current.moved = true
      setIsDragging(true)
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current.captured = true
      } catch {
        // ignore: pointer may already be gone
      }
    }

    e.preventDefault()
    setDragOffset(dx)
  }, [])

  const onPointerUp = useCallback(
    (e) => finish(e.pointerId, e.currentTarget),
    [finish],
  )

  const onPointerCancel = useCallback(
    (e) => finish(e.pointerId, e.currentTarget),
    [finish],
  )

  const onClickCapture = useCallback((e) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }, [])

  return {
    isDragging,
    dragOffset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
    },
  }
}
