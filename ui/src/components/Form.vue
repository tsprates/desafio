<script setup>
import axios from 'axios';
import { ref } from 'vue';
import Chart from './Chart.vue';
import FileChooser from './FileChooser.vue';

const route = ref('churn-rate')
const dataset = ref([])
const loading = ref(false)
const file = ref(null)
const title = ref('')

const titles = {
  'churn-rate': 'Churn Rate',
  'monthly-recurring-revenue': 'Monthly Recurring Revenue',
};

const makeRequest = (endpoint) => {
  const baseUrl = import.meta.env.VITE_BASE_API;
  dataset.value = [];
  axios.get(`${baseUrl}/${endpoint}`)
    .then(response => {
      const { data } = response;
      for (let i in data) {
        dataset.value.push({ label: i, value: data[i] });
      }
      title.value = titles[endpoint]
    })
    .catch(error => console.error(error))
};


const changeChart = (event) => makeRequest(event.target.value);

const handleSubmit = () => {
  const baseUrl = import.meta.env.VITE_BASE_API;
  const data = new FormData();

  data.append('file', file.value);

  loading.value = true;

  axios.post(`${baseUrl}/upload`, data, { headers: { 'Content-Type': `multipart/form-data` } })
    .then(() => makeRequest(route.value))
    .catch(error => console.error(error))
    .finally(() => (loading.value = false));
}
</script>

<template>
  <div class="max-w-screen-lg mx-auto p-3 mt-10">
    <h1 class="text-blue-400 text-center text-5xl font-bold py-3 my-4">Métricas de Negócio</h1>
    <div class="bg-white shadow-md rounded-lg p-3 flex flex-col items-center justify-between">
      <form enctype="multipart/form-data" @submit.prevent="handleSubmit"
        class="flex flex-row items-center justify-between gap-2 w-full">
        <p>
          <FileChooser v-model="file" />
        </p>
        <p>
          <button type="submit" :disabled="!file"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 inline-flex items-center">
            <svg aria-hidden="true" role="status" v-if="loading"
              class="inline w-4 h-4 mx-4 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101"
              fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor" />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="#1C64F2" />
            </svg>
            <span v-if="!loading">Enviar</span>
          </button>
        </p>
      </form>
      <div v-if="dataset.length !== 0" class="w-full text-center">
        <select v-model="route" @change="changeChart"
          class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">
          <option value="churn-rate">Churn rate</option>
          <option value="monthly-recurring-revenue">Monthly Recurring Revenue</option>
        </select>
        <Chart :title="title" :data="dataset" class="mt-8" />
      </div>
    </div>
  </div>
</template>