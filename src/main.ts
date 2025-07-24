import { createApp } from "vue";
import App from "./App.vue";

// PrimeVue v4 setup
import PrimeVue from "primevue/config";
import "primevue/resources/themes/lara-dark-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// Import components as needed (v4 uses auto-import or local registration, but we can register globally for main ones)
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Listbox from "primevue/listbox";
import Card from "primevue/card";
import Divider from "primevue/divider";

const app = createApp(App);
app.use(PrimeVue);
app.component("Button", Button);
app.component("InputText", InputText);
app.component("Dropdown", Dropdown);
app.component("Listbox", Listbox);
app.component("Card", Card);
app.component("Divider", Divider);

app.mount("#app");
