import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import React from 'react'

interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  profileImage: string | null
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  isVerified: boolean
  isEmailVerified: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  expiresAt: number | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token: string, expiresAt?: number) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  isTokenValid: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true until we check localStorage
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: (user, token, expiresAt) => set({ 
        user, 
        token, 
        expiresAt: expiresAt || null,
        isAuthenticated: true, 
        isLoading: false,
      }),
      logout: () => set({ 
        user: null, 
        token: null, 
        expiresAt: null,
        isAuthenticated: false, 
        isLoading: false,
      }),
      setLoading: (loading) => set({ isLoading: loading }),
      isTokenValid: () => {
        const { expiresAt, isAuthenticated } = get()
        if (!isAuthenticated || !expiresAt) return false
        return Date.now() < expiresAt
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, check token expiry and set loading to false
        if (state) {
          // Check if token has expired
          if (state.expiresAt && Date.now() >= state.expiresAt) {
            // Token expired, clear auth state
            state.user = null
            state.token = null
            state.expiresAt = null
            state.isAuthenticated = false
          }
          state.isLoading = false
        }
      },
    }
  )
)

// Hook to check if store has been hydrated
export const useAuthStoreHydration = () => {
  const [hasHydrated, setHasHydrated] = React.useState(false)
  
  React.useEffect(() => {
    // Zustand persist hydrates asynchronously
    // We need to wait for it to finish
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    
    // If already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true)
    }
    
    return unsubscribe
  }, [])
  
  return hasHydrated
}

// UI State Store
interface UIState {
  isSidebarOpen: boolean
  isMobileMenuOpen: boolean
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}))

// Search/Filter Store
interface SearchFilters {
  transportType: string
  fromCity: string
  toCity: string
  travelDate: string
  priceMin: number
  priceMax: number
  classType: string
}

interface SearchState {
  filters: SearchFilters
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
}

const defaultFilters: SearchFilters = {
  transportType: '',
  fromCity: '',
  toCity: '',
  travelDate: '',
  priceMin: 0,
  priceMax: 0,
  classType: '',
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}))
