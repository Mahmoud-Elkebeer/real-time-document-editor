<template>
    <div class="history-container">
        <h3>Document History</h3>
        <ul>
            <li v-for="version in versions" :key="version.id">
                <span>{{ formatDate(version.created_at) }}</span>
                <button @click="loadVersion(version)">View</button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const versions = ref([])

onMounted(async () => {
    const { data } = await axios.get(`/documents/${route.params.id}/versions`)
    versions.value = data
})

const loadVersion = (version) => {
    alert(version.content)
}

const formatDate = (date) => {
    return new Date(date).toLocaleString()
}
</script>

<style scoped>
.history-container {
    margin-top: 2rem;
}
</style>
