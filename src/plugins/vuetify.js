// plugins/vuetify.js
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1E88E5',
          secondary: '#42A5F5',
          accent: '#2196F3',
          error: '#F44336',
          warning: '#FF9800',
          info: '#2196F3',
          success: '#4CAF50',
          surface: '#FAFAFA',
          background: '#FFFFFF',
        },
      },
      dark: {
        colors: {
          primary: '#BB86FC',
          secondary: '#03DAC6',
          accent: '#CF6679',
          error: '#CF6679',
          warning: '#FFC107',
          info: '#2196F3',
          success: '#4CAF50',
          surface: '#1E1E1E',
          background: '#121212',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none;',
      ripple: true,
    },
    VCard: {
      elevation: 2,
    },
    VTextField: {
      hideDetails: 'auto',
      variant: 'filled',
    },
    VSelect: {
      hideDetails: 'auto',
      variant: 'filled',
    },
    VAutocomplete: {
      hideDetails: 'auto',
      variant: 'filled',
    },
    VTextarea: {
      hideDetails: 'auto',
      variant: 'filled',
    },
  },
});