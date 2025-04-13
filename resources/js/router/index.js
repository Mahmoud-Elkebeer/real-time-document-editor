import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/auth/Login.vue';
import Register from '../components/auth/Register.vue';
import DocumentList from '../components/docments/DocumentList.vue';
import DocumentEditor from '../components/docments/DocumentEditor.vue';
import store from '../store/index.js'

const routes = [
    { path: '/', redirect: '/documents' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/documents', component: DocumentList, meta: { requiresAuth: true } },
    { path: '/documents/:id', component: DocumentEditor, props: true, meta: { requiresAuth: true } }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!store.state.user
    const token = localStorage.getItem('token')

    if (token && !isAuthenticated) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        store.dispatch('fetchCurrentUser')
            .then(() => {
                next()
            })
            .catch(() => {
                localStorage.removeItem('token')
                delete axios.defaults.headers.common['Authorization']
                next('/login')
            })
    } else if (to.meta.requiresAuth && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router;
