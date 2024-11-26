import App from '@/App.vue';

const $App = createApp(App);
const $Pinia = createPinia();

$App.use($Router);
$App.use($Pinia);
$App.use($I18n);

$App.mount('#app');
// fnMap(修复)待办内容1
// outlinePlus(Note)update the name
