<template>
    <div v-if="document" class="editor-layout">
        <!-- History Sidebar -->
        <div class="history-sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
            <button class="sidebar-toggle" @click="toggleSidebar" :title="isSidebarCollapsed ? 'Show History' : 'Hide History'">
                <span class="toggle-icon">
                    <svg v-if="isSidebarCollapsed" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                    <svg v-else width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                    </svg>
                </span>
            </button>

            <div class="history-content" v-if="!isSidebarCollapsed">
                <h3 class="history-title">Document History</h3>
                <div class="version-list">
                    <div v-for="(version, index) in versions"
                         :key="version.id"
                         class="version-item"
                         :class="{ 'active-version': version.id === currentVersionId }"
                         @click="previewVersion(version)">
                        <div class="version-number">[{{ versions.length - index }}]</div>
                        <div class="version-details">
                            <div class="version-meta">
                                <span class="version-id">{{ version.id }}</span>
                                <span class="version-time">{{ formatTime(version.created_at) }}</span>
                            </div>
                            <div class="version-preview">{{ getPreviewText(version.content) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Editor Content -->
        <div class="editor-main">
            <div class="header-bar">
                <div class="editor-header">
                    <h2 class="editor-title">Editing: <span class="document-title">{{ document.title }}</span></h2>
                    <p v-if="saving" class="saving-indicator">
                        <span class="saving-dot"></span> Saving...
                    </p>
                </div>
                <button @click="logout" class="logout-button">
                    Logout
                </button>
            </div>

            <textarea
                v-model="documentContent"
                @input="saveDocument"
                class="editor-textarea"
                placeholder="Start writing your document here..."
            ></textarea>

            <div class="collaborators-section" v-if="activeUsers.length">
                <h3 class="collaborators-title">Active Collaborators</h3>
                <ul class="collaborators-list">
                    <li v-for="user in activeUsers" :key="user.id" class="collaborator-item">
                        <span class="user-avatar">{{ getUserInitial(user.name) }}</span>
                        {{ user.name }}
                    </li>
                </ul>
            </div>

            <!-- Version Preview Modal -->
            <div v-if="previewedVersion" class="version-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Version from {{ formatDate(previewedVersion.created_at) }}</h3>
                        <button class="close-modal" @click="previewedVersion = null">×</button>
                    </div>
                    <div class="modal-body">
                        <pre>{{ previewedVersion.content }}</pre>
                    </div>
                    <div class="modal-footer">
                        <button class="restore-btn" @click="restoreVersion">Restore this version</button>
                        <button class="cancel-btn" @click="previewedVersion = null">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import debounce from 'lodash/debounce';
import axios from 'axios';

const store = useStore();
const route = useRoute();
const router = useRouter();

const document = computed(() => store.state.currentDocument);
const activeUsers = computed(() => store.state.activeUsers);
const documentContent = ref('');
const saving = ref(false);
const versions = ref([]);
const isSidebarCollapsed = ref(false);
const previewedVersion = ref(null);
const currentVersionId = ref(null);

const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
};

onMounted(async () => {
    const documentId = route.params.id;

    await store.dispatch('fetchDocument', documentId);
    documentContent.value = document.value.content;
    currentVersionId.value = document.value.current_version_id;

    await fetchVersions(documentId);
    await store.dispatch('subscribeToDocument', documentId);
});

const fetchVersions = async (documentId) => {
    try {
        const { data } = await axios.get(`/documents/${documentId}/versions`);
        versions.value = data;
    } catch (error) {
        console.error('Error fetching versions:', error);
    }
};

watch(
    () => document.value?.content,
    (newContent) => {
        if (newContent !== documentContent.value) {
            documentContent.value = newContent;
        }
    },
    { immediate: true }
);

const saveDocument = debounce(() => {
    saving.value = true;

    store.dispatch('updateDocument', {
        id: route.params.id,
        content: documentContent.value,
    })
        .then(() => {
            saving.value = false;
            fetchVersions(route.params.id);
        })
        .catch(() => {
            saving.value = false;
            alert('Failed to save document.');
        });
}, 500);

const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getPreviewText = (content) => {
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
};

const previewVersion = (version) => {
    previewedVersion.value = version;
};

const restoreVersion = async () => {
    if (!previewedVersion.value) return;

    try {
        documentContent.value = previewedVersion.value.content;
        await saveDocument();
        previewedVersion.value = null;
    } catch (error) {
        console.error('Error restoring version:', error);
        alert('Failed to restore version.');
    }
};

const logout = async () => {
    try {
        await store.dispatch('logout');
        await router.push('/login');
    } catch (err) {
        console.error('Logout failed:', err);
    }
};
</script>

<style scoped>
.editor-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

.history-sidebar {
    width: 300px;
    background-color: #f8f9fa;
    border-right: 1px solid #e0e0e0;
    position: relative;
    height: 100%;
    transition: transform 0.3s ease;
}

.sidebar-collapsed {
    transform: translateX(-260px);
}

.sidebar-toggle {
    position: absolute;
    right: -40px;
    top: 20px;
    width: 40px;
    height: 40px;
    background: #646cff;
    border: none;
    border-radius: 0 20px 20px 0;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;
}

.sidebar-toggle:hover {
    background: #535bf2;
}

.toggle-icon {
    display: flex;
    align-items: center;
}

.history-content {
    padding: 1.5rem;
    height: calc(100% - 3rem);
    overflow-y: auto;
}

.history-title {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #444;
    font-size: 1.2rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
}

.version-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.version-item {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.2s ease;
}

.version-item:hover {
    border-color: #646cff;
    background-color: #f5f5ff;
}

.active-version {
    border-left: 3px solid #646cff;
    background-color: #f5f5ff;
}

.version-number {
    font-weight: bold;
    color: #646cff;
    min-width: 24px;
}

.version-details {
    flex: 1;
    overflow: hidden;
}

.version-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.25rem;
}

.version-id {
    font-family: monospace;
}

.version-time {
    color: #888;
}

.version-preview {
    font-size: 0.9rem;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.editor-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    overflow: hidden;
}

.header-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    gap: 1rem;
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
    flex-shrink: 0;
    align-self: center;
}

.logout-button:hover {
    background-color: #fff2f0;
}

.editor-header {
    flex-grow: 1;
}

.editor-title {
    font-size: 1.5rem;
    color: #2c3e50;
    font-weight: 600;
    margin: 0;
}

.document-title {
    color: #646cff;
    font-weight: 500;
}

.saving-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    color: #666;
    font-size: 0.9rem;
}

.saving-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #646cff;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.3; }
    100% { opacity: 1; }
}

.editor-textarea {
    flex: 1;
    padding: 1rem;
    border: none;
    font-size: 1rem;
    resize: none;
    outline: none;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 2px rgba(100, 108, 255, 0.2);
}

.editor-textarea:focus {
    outline: none;
    border-color: #646cff;
}

.editor-textarea::placeholder {
    color: #aaa;
}

.collaborators-section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
}

.collaborators-title {
    font-size: 1.1rem;
    color: #555;
    margin-bottom: 0.75rem;
    font-weight: 500;
}

.collaborators-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.collaborator-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #f5f5ff;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-size: 0.9rem;
    color: #444;
}

.user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: green;
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
}

.version-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #444;
}

.close-modal {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0 0.5rem;
}

.close-modal:hover {
    color: #333;
}

.modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
}

.modal-body pre {
    white-space: pre-wrap;
    font-family: inherit;
    margin: 0;
    line-height: 1.6;
}

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.restore-btn {
    padding: 0.5rem 1rem;
    background-color: #646cff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.restore-btn:hover {
    background-color: #535bf2;
}

.cancel-btn {
    padding: 0.5rem 1rem;
    background-color: #f0f0f0;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.cancel-btn:hover {
    background-color: #e0e0e0;
}

.history-content::-webkit-scrollbar,
.editor-textarea::-webkit-scrollbar,
.modal-body::-webkit-scrollbar {
    width: 8px;
}

.history-content::-webkit-scrollbar-track,
.editor-textarea::-webkit-scrollbar-track,
.modal-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.history-content::-webkit-scrollbar-thumb,
.editor-textarea::-webkit-scrollbar-thumb,
.modal-body::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.history-content::-webkit-scrollbar-thumb:hover,
.editor-textarea::-webkit-scrollbar-thumb:hover,
.modal-body::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
