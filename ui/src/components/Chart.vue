<template>
    <canvas id="chart"></canvas>
</template>

<script setup>
import Chart from 'chart.js/auto';
import { onMounted, ref, watch } from 'vue';

const { title, data } = defineProps({
    title: {
        required: true,
        type: String
    },
    data: {
        required: true,
        type: Array,
    }
});

const labels = data.map((item) => item.label)
const values = data.map((item) => item.value)

const chart = ref(null);

onMounted(() => {
    const ctx = document.getElementById('chart').getContext('2d');

    chart.value = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: title,
                data: values,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
});


watch(data, () => {
    if (chart.value) {
        const labels = data.value.map(item => item.label);
        const values = data.value.map(item => item.value);

        chart.value.data.labels = labels;
        chart.value.data.datasets[0].data = values;
        chart.value.data.datasets[0].label = title;
        chart.value.update();
    }
}, { immediate: true });
</script>