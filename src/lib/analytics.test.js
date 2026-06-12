import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  EVENTS,
  MILESTONES,
  track,
  trackKitAdded,
  setTransport,
  _resetForTests,
} from './analytics.js'

beforeEach(() => _resetForTests())

describe('EVENTS', () => {
  it('covers the activation funnel from the blitz plan', () => {
    expect(EVENTS.SIGNUP_COMPLETED).toBeDefined()
    expect(EVENTS.KIT_ADDED).toBeDefined()
    expect(EVENTS.KIT_MILESTONE).toBeDefined()
    expect(EVENTS.SHARE_CLICKED).toBeDefined()
  })

  it('milestones include first kit and five kits', () => {
    expect(MILESTONES).toContain(1)
    expect(MILESTONES).toContain(5)
  })
})

describe('track', () => {
  it('sends known events through the transport', () => {
    const transport = vi.fn()
    setTransport(transport)
    track(EVENTS.SIGNUP_COMPLETED, { method: 'email' })
    expect(transport).toHaveBeenCalledWith(EVENTS.SIGNUP_COMPLETED, { method: 'email' })
  })

  it('drops unknown events without calling the transport', () => {
    const transport = vi.fn()
    setTransport(transport)
    expect(track('made_up_event')).toBe(false)
    expect(transport).not.toHaveBeenCalled()
  })

  it('never throws when the transport fails', () => {
    setTransport(() => { throw new Error('provider down') })
    expect(() => track(EVENTS.KIT_ADDED)).not.toThrow()
  })
})

describe('trackKitAdded', () => {
  it('emits kit_added with the running count', () => {
    const transport = vi.fn()
    setTransport(transport)
    trackKitAdded(3)
    expect(transport).toHaveBeenCalledTimes(1)
    expect(transport).toHaveBeenCalledWith(EVENTS.KIT_ADDED, { count: 3 })
  })

  it('also emits the milestone event at milestone counts', () => {
    const transport = vi.fn()
    setTransport(transport)
    trackKitAdded(1)
    expect(transport).toHaveBeenCalledWith(EVENTS.KIT_ADDED, { count: 1 })
    expect(transport).toHaveBeenCalledWith(EVENTS.KIT_MILESTONE, { count: 1 })

    transport.mockClear()
    trackKitAdded(5)
    expect(transport).toHaveBeenCalledWith(EVENTS.KIT_MILESTONE, { count: 5 })
  })

  it('ignores invalid counts', () => {
    const transport = vi.fn()
    setTransport(transport)
    trackKitAdded(undefined)
    trackKitAdded(-1)
    expect(transport).not.toHaveBeenCalled()
  })
})

describe('default transport buffering', () => {
  it('buffers events when no provider is wired, capped', async () => {
    const { _buffer } = await import('./analytics.js')
    track(EVENTS.SIGNUP_COMPLETED)
    expect(_buffer.length).toBe(1)
    expect(_buffer[0].name).toBe(EVENTS.SIGNUP_COMPLETED)
    for (let i = 0; i < 300; i++) track(EVENTS.KIT_ADDED, { count: i })
    expect(_buffer.length).toBeLessThanOrEqual(200)
  })
})
