import App from '@/App.vue';
import '@vscode/codicons/dist/codicon.css';
import 'virtual:uno.css';

const $App = createApp(App);
const $Pinia = createPinia();

$App.use($Pinia);

$App.mount('#app');
