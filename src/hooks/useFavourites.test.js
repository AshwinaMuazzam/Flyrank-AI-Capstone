import { renderHook, act } from '@testing-library/react'
import { useFavourites } from './useFavourites.js'

const a = { imdbID: 'tt1', Title: 'A' }
const b = { imdbID: 'tt2', Title: 'B' }

describe('useFavourites', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useFavourites())
    expect(result.current.favourites).toEqual([])
  })

  it('toggles a movie on and off', () => {
    const { result } = renderHook(() => useFavourites())
    act(() => result.current.toggleFavourite(a))
    expect(result.current.isFavourite('tt1')).toBe(true)
    act(() => result.current.toggleFavourite(a))
    expect(result.current.isFavourite('tt1')).toBe(false)
  })

  it('does not add duplicates', () => {
    const { result } = renderHook(() => useFavourites())
    act(() => {
      result.current.addFavourite(a)
      result.current.addFavourite(a)
    })
    expect(result.current.favourites).toHaveLength(1)
  })

  it('persists to and restores from localStorage', () => {
    const first = renderHook(() => useFavourites())
    act(() => first.result.current.addFavourite(b))
    first.unmount()
    const second = renderHook(() => useFavourites())
    expect(second.result.current.favourites).toEqual([b])
  })

  it('survives corrupted localStorage data', () => {
    localStorage.setItem('movie-app-favourites', '{not json')
    const { result } = renderHook(() => useFavourites())
    expect(result.current.favourites).toEqual([])
  })
})
