<template>
    <div class="container mx-auto p-6">
        <h1 class="text-2xl font-bold mb-4">Create New Document</h1>

        <form @submit.prevent="createDocument" class="space-y-4">
            <div>
                <label class="block font-semibold mb-1">Title</label>
                <input
                    type="text"
                    v-model="form.title"
                    class="border border-gray-300 rounded px-4 py-2 w-full"
                    required
                />
            </div>

            <div>
                <label class="block font-semibold mb-1">Content</label>
                <textarea
                    v-model="form.content"
                    rows="8"
                    class="border border-gray-300 rounded px-4 py-2 w-full"
                    required
                ></textarea>
            </div>

            <button
                type="submit"
                class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
                Create
            </button>
        </form>
    </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/axios'

const router = useRouter()

const form = reactive({
    title: '',
    content: '',
})

const createDocument = async () => {
    try {
        await axios.post('/api/documents', form)
        alert('Document created successfully!')
        router.push('/documents')
    } catch (error) {
        console.error(error)
        alert('Failed to create document.')
    }
}
</script>
