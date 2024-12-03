import { createApp } from 'vue';
import App from './App.vue';
import customUse from './use';

const app = createApp(App);
customUse(app);
app.mount('#app');
