import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
  ]
})

// require Connexion
router.beforeEach(async (to) => {

  // if (to.meta.requiresCandidat && !estCandidatConnecte()) {
  //   return {
  //     name: 'candidat-login',
  //     query: { redirect: to.fullPath },
  //   }
  // }

  // if (!to.meta.requiresAuth) return true

  // try {
  //   const response = await fetch('/api/auth/me', { credentials: 'include' })
  //   if (!response.ok) throw new Error()
  //   const { utilisateur } = await response.json()
  //   if (!utilisateur) throw new Error()
  //   if (to.meta.roles && !to.meta.roles.includes(utilisateur.role)) {
  //     return '/login'
  //   }
  //   return true
  // } catch {
  //   return { path: '/login', query: { redirect: to.fullPath } }
  // }
})

export default router
