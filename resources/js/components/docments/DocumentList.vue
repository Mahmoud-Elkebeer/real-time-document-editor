<template>
    <div class="document-container">
        <div class="header-bar">
            <h2 class="document-title">Documents List</h2>
            <button @click="logout" class="logout-button">
                Logout
            </button>
        </div>

        <div class="document-controls">
            <div class="document-create">
                <input
                    v-model="newTitle"
                    placeholder="New Document Title"
                    class="document-input"
                    @keyup.enter="createDocument"
                />
                <button
                    @click="createDocument"
                    :disabled="loading"
                    class="document-button create-button"
                >
                    <span v-if="loading">Creating...</span>
                    <span v-else>+ Create</span>
                </button>
            </div>

            <button
                @click="fetchDocuments"
                class="document-button refresh-button"
            >
                ↻ Refresh
            </button>
        </div>

        <ul class="document-list">
            <li v-for="doc in documents" :key="doc.id" class="document-item">
                <router-link
                    :to="`/documents/${doc.id}`"
                    class="document-link"
                >
                    {{ doc.title }}
                    <span class="document-arrow">→</span>
                </router-link>
            </li>
        </ul>

        <p v-if="error" class="document-error">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const newTitle = ref('');
const loading = ref(false);
const error = ref('');

const documents = computed(() => store.state.documents);

const logout = async () => {
    try {
        await store.dispatch('logout');
        router.push('/login');
    } catch (err) {
        console.error('Logout failed:', err);
    }
};

const fetchDocuments = () => {
    store.dispatch('fetchDocuments');
};

const createDocument = async () => {
    if (!newTitle.value.trim()) {
        error.value = 'Please enter a title.';
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        const document = await store.dispatch('createDocument', newTitle.value);
        newTitle.value = '';
        router.push(`/documents/${document.id}`);
    } catch (err) {
        console.error(err);
        error.value = 'Failed to create document. Please try again.';
    } finally {
        loading.value = false;
    }
};

onMounted(fetchDocuments);
</script>

<style scoped>
.header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.logout-button {
    padding: 0.5rem 1rem;
    background-color: #fff;
    color: #ff4d4f;
    border: 1px solid #ff4d4f;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.logout-button:hover {
    background-color: #fff2f0;
}

.document-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.document-title {
    font-size: 1.8rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-weight: 600;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
}

.document-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
}

.document-create {
    display: flex;
    flex-grow: 1;
    gap: 0.5rem;
}

.document-input {
    flex-grow: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
}

.document-input:focus {
    outline: none;
    border-color: #646cff;
    box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
}

.document-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.create-button {
    background-color: #646cff;
    color: white;
}

.create-button:hover:not(:disabled) {
    background-color: #535bf2;
}

.create-button:disabled {
    background-color: #a1a5ff;
    cursor: not-allowed;
}

.refresh-button {
    background-color: #f5f5f5;
    color: #2c3e50;
}

.refresh-button:hover {
    background-color: #eaeaea;
}

.document-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.document-item {
    transition: all 0.2s ease;
}

.document-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    text-decoration: none;
    color: #2c3e50;
    background-color: #f9f9f9;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.document-link:hover {
    background-color: #f0f0f0;
    transform: translateX(4px);
}

.document-arrow {
    color: #646cff;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.document-link:hover .document-arrow {
    opacity: 1;
}

.document-error {
    color: #ff4d4f;
    margin-top: 1rem;
    padding: 0.5rem;
    background-color: #fff2f0;
    border-radius: 4px;
    border-left: 3px solid #ff4d4f;
}
</style>
