import App from '@/App.vue';
import 'virtual:uno.css';

const $App = createApp(App);
const $Pinia = createPinia();

$App.use($Router);
$App.use($Pinia);
$App.use($I18n);

$App.mount('#app');
