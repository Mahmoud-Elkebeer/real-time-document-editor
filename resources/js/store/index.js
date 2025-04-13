import { createStore } from 'vuex';
import api from '../api/api';

export default createStore({
    state: {
        user: null,
        token: localStorage.getItem('token') || '',
        documents: [],
        currentDocument: null,
        activeUsers: [],
    },
    mutations: {
        setUser(state, user) { state.user = user; },
        setToken(state, token) { state.token = token; localStorage.setItem('token', token); },
        clearAuth(state) { state.user = null; state.token = ''; localStorage.removeItem('token'); },

        setDocuments(state, documents) { state.documents = documents; },
        setCurrentDocument(state, document) {
            state.currentDocument = document;
            console.log('Setting document in state:', document);
        },
        updateDocument(state, document) { state.currentDocument.content = document.content; },
        setDocument(state, document) {
            state.currentDocument = document;
        },
        setActiveUsers(state, users) {
            state.activeUsers = users;
        },
        addActiveUser(state, user) {
            const exists = state.activeUsers.find(u => u.id === user.id);
            if (!exists) {
                state.activeUsers.push(user);
            }
        },
        removeActiveUser(state, user) {
            state.activeUsers = state.activeUsers.filter(u => u.id !== user.id);
        }
    },
    actions: {
        async login({ commit }, credentials) {
            const res = await api.post('/login', credentials);
            commit('setToken', res.data.token);
            commit('setUser', res.data.user);
        },
        async fetchCurrentUser({ commit }) {
            try {
                const response = await axios.get('/user')
                commit('setUser', response.data)
                return response.data
            } catch (error) {
                commit('clearAuth')
                throw error
            }
        },
        async register({ commit }, data) {
            const res = await api.post('/register', data);
            commit('setToken', res.data.token);
            commit('setUser', res.data.user);
        },
        async logout({ commit, state }) {
            if (state.user) {
                commit('removeActiveUser', state.user);
            }
            commit('clearAuth');
        },
        async fetchDocuments({ commit }) {
            const res = await api.get('/documents');
            commit('setDocuments', res.data.data);
        },
        async createDocument({ dispatch }, title) {
            const response = await api.post('/documents', { title });
            const document = response.data;
            dispatch('fetchDocuments');
            return document;
        },
        async fetchDocument({ commit }, id) {
            const res = await api.get(`/documents/${id}`);
            commit('setCurrentDocument', res.data);
        },
        async saveDocument({ state }) {
            await api.put(`/documents/${state.currentDocument.id}`, {
                title: state.currentDocument.title,
                content: state.currentDocument.content
            });
        },
        async subscribeToDocument({ commit }, documentId) {
            if (!documentId) {
                console.error("Document ID is required for subscribing!");
                return;
            }

            try {
                const channel = Echo.join(`document.${documentId}`)
                    .here(users => {
                        console.log('Active users:', users);
                        commit('setActiveUsers', users);
                    })
                    .joining(user => {
                        console.log('User joined:', user);
                        commit('addActiveUser', user);
                    })
                    .leaving(user => {
                        console.log('User left:', user);
                        commit('removeActiveUser', user);
                    })
                    .listen('DocumentUpdated', (event) => {
                        console.log('Document updated:', event);
                        commit('setCurrentDocument', event.document);
                    });
            } catch (error) {
                console.error("Error subscribing to document:", error);
            }
        },
        async updateDocument({ commit }, { id, content }) {
            try {
                const response = await axios.put(`/documents/${id}`, {
                    content,
                });
                commit('setDocument', response.data);

                return response.data;
            } catch (error) {
                console.error('Error updating document:', error);
                throw error;
            }
        },
    },
    getters: {
        isAuthenticated: state => !!state.user,
        currentDocument(state) {
            return state.currentDocument;
        },
        activeUsers: (state) => state.activeUsers,
    },
});
