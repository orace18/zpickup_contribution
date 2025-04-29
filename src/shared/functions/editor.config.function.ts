import { environment } from "../../environments/environment";

export const EDITOR_CONFIG = {
  apiKey: environment.tiny_api_key,
  base_url: '/tinymce',
  suffix: '.min',
  language: 'fr_FR',  
  language_url: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/langs/fr_FR.min.js',
  height: 500,
  menubar: true,
  plugins: ['preview'],
  toolbar: true,
  readonly: true,
  content_style: 'body { font-family: Arial, sans-serif; }',
  branding: false,
  elementpath: false,
  statusbar: false,
  setup: (editor: any) => {
    editor.on('init', () => {
      console.log('Éditeur initialisé');
    });
  }
};