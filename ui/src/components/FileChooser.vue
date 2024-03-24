<script setup>
import { ref } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);
const fileName = ref('Escolha um arquivo (formato .xlsx ou .csv)');

const setFile = (event) => {
    emit('update:modelValue', event.target.files[0]);
    fileName.value = event.target.files[0].name;
};
</script>

<template>
    <label for="dataset"
        class="text-blue-400 p-4 my-4 flex flex-row items-center justify-center gap-4 hover:cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-blue-400 ">
            <path fill-rule="evenodd"
                d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                clip-rule="evenodd" />
        </svg>
        <span>{{ fileName }}</span>
    </label>
    <input id="dataset" type="file" required class="hidden" accept=".csv,.xlsx" @input="setFile" />
</template>