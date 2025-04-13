<template>
    <div class="register-container">
        <h2>Register</h2>
        <form @submit.prevent="register">
            <div class="form-group">
                <label for="name">Name</label>
                <input
                    type="text"
                    id="name"
                    v-model="name"
                    required
                    autofocus
                    :class="{ 'is-invalid': errors.name }"
                />
                <span class="error" v-if="errors.name">{{ errors.name[0] }}</span>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input
                    type="email"
                    id="email"
                    v-model="email"
                    required
                    :class="{ 'is-invalid': errors.email }"
                />
                <span class="error" v-if="errors.email">{{ errors.email[0] }}</span>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    v-model="password"
                    required
                    :class="{ 'is-invalid': errors.password }"
                />
                <span class="error" v-if="errors.password">{{ errors.password[0] }}</span>
            </div>
            <button type="submit" :disabled="loading">
                <span v-if="loading">Processing...</span>
                <span v-else>Register</span>
            </button>
            <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </div>
            <div class="login-link">
                Already have an account? <router-link to="/login">Login here</router-link>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const errors = ref({});
const errorMessage = ref('');
const loading = ref(false);

const store = useStore();
const router = useRouter();

const register = async () => {
    loading.value = true;
    errors.value = {};
    errorMessage.value = '';

    try {
        await store.dispatch('register', {
            name: name.value,
            email: email.value,
            password: password.value
        });
        await router.push('/documents');
    } catch (error) {
        if (error.response && error.response.status === 422) {
            errors.value = error.response.data.errors;
        } else {
            errorMessage.value = error.response?.data?.message || 'Registration failed. Please try again.';
        }
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.register-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-top: 50px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

input.is-invalid {
    border-color: #dc3545;
}

button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    margin-top: 10px;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.error-message {
    color: #dc3545;
    margin-top: 10px;
    text-align: center;
}

.error {
    color: #dc3545;
    font-size: 0.8rem;
    display: block;
    margin-top: 5px;
}

.login-link {
    margin-top: 15px;
    text-align: center;
}

.login-link a {
    color: #4CAF50;
    text-decoration: none;
}

.login-link a:hover {
    text-decoration: underline;
}
</style>
