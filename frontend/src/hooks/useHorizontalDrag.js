import { useCallback, useEffect, useRef, useState } from 'react'

const MOVE_THRESHOLD = 6

function releaseCapture(el, pointerId) {
  if (pointerId == null || !el?.hasPointerCapture?.(pointerId)) return
  try {
    el.releasePointerCapture(pointerId)
  } catch {
    // ignore
  }
}

/** Click + drag horizontal scroll for overflow containers. */
export function useDragScroll({ onDragStart, onDragEnd, disabled = false } = {}) {
  const ref = useRef(null)
  const drag = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
    captured: false,
    pointerId: null,
  })
  const [isDragging, setIsDragging] = useState(false)

  const resetDrag = useCallback(() => {
    drag.current.active = false
    drag.current.moved = false
    drag.current.captured = false
    drag.current.pointerId = null
    setIsDragging(false)
  }, [])

  const finish = useCallback(
    (pointerId, el) => {
      if (!drag.current.active) return
      const moved = drag.current.moved
      const pid = pointerId ?? drag.current.pointerId
      const target = el ?? ref.current
      resetDrag()
      releaseCapture(target, pid)
      onDragEnd?.(moved)
    },
    [onDragEnd, resetDrag],
  )

  useEffect(() => {
    const onWindowEnd = (e) => {
      if (drag.current.active) finish(e.pointerId, ref.current)
    }
    window.addEventListener('pointerup', onWindowEnd)
    window.addEventListener('pointercancel', onWindowEnd)
    return () => {
      window.removeEventListener('pointerup', onWindowEnd)
      window.removeEventListener('pointercancel', onWindowEnd)
    }
  }, [finish])

  const onPointerDown = useCallback(
    (e) => {
      const el = ref.current
      if (!el || disabled || e.button !== 0) return

      releaseCapture(el, drag.current.pointerId)

      drag.current = {
        active: true,
        startX: e.clientX,
        scrollLeft: el.scrollLeft,
        moved: false,
        captured: false,
        pointerId: e.pointerId,
      }
      setIsDragging(false)
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
        drag.current.captured = true
        drag.current.pointerId = e.pointerId
      } catch {
        // ignore
      }
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

  const onLostPointerCapture = useCallback(
    (e) => {
      if (drag.current.pointerId === e.pointerId) resetDrag()
    },
    [resetDrag],
  )

  const onClickCapture = useCallback((e) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
    drag.current.moved = false
  }, [])

  return {
    ref,
    isDragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
      onClickCapture,
    },
  }
}

/** Click + drag swipe for index-based carousels. */
export function useDragSwipe(onSwipe, { threshold = 48, disabled = false } = {}) {
  const drag = useRef({
    active: false,
    startX: 0,
    lastX: 0,
    moved: false,
    captured: false,
    pointerId: null,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const trackRef = useRef(null)

  const resetDrag = useCallback(() => {
    drag.current.active = false
    drag.current.moved = false
    drag.current.captured = false
    drag.current.pointerId = null
    setIsDragging(false)
    setDragOffset(0)
  }, [])

  const finish = useCallback(
    (pointerId, el) => {
      if (!drag.current.active) return
      const dx = drag.current.lastX - drag.current.startX
      const moved = drag.current.moved
      const pid = pointerId ?? drag.current.pointerId
      const target = el ?? trackRef.current
      resetDrag()
      releaseCapture(target, pid)

      if (moved) {
        if (dx <= -threshold) onSwipe(1)
        else if (dx >= threshold) onSwipe(-1)
      }
    },
    [onSwipe, resetDrag, threshold],
  )

  useEffect(() => {
    const onWindowEnd = (e) => {
      if (drag.current.active) finish(e.pointerId, trackRef.current)
    }
    window.addEventListener('pointerup', onWindowEnd)
    window.addEventListener('pointercancel', onWindowEnd)
    return () => {
      window.removeEventListener('pointerup', onWindowEnd)
      window.removeEventListener('pointercancel', onWindowEnd)
    }
  }, [finish])

  const onPointerDown = useCallback(
    (e) => {
      if (disabled || e.button !== 0) return
      trackRef.current = e.currentTarget
      releaseCapture(e.currentTarget, drag.current.pointerId)

      drag.current = {
        active: true,
        startX: e.clientX,
        lastX: e.clientX,
        moved: false,
        captured: false,
        pointerId: e.pointerId,
      }
      setIsDragging(false)
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
        drag.current.pointerId = e.pointerId
      } catch {
        // ignore
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

  const onLostPointerCapture = useCallback(
    (e) => {
      if (drag.current.pointerId === e.pointerId) resetDrag()
    },
    [resetDrag],
  )

  const onClickCapture = useCallback((e) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
    drag.current.moved = false
  }, [])

  return {
    isDragging,
    dragOffset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
      onClickCapture,
    },
  }
}
