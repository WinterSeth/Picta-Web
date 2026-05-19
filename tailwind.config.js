module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Color primario (azul oscuro #292c48)
        primary: {
          50: '#e5e6ea',
          100: '#bfc1cb',
          200: '#9497a9',
          300: '#696d87',
          400: '#494e6d',
          500: '#292c48', // tu color base
          600: '#091b36',
          700: '#1f2138',
          800: '#191b30',
          900: '#0f1021',
        },
        // Color secundario (rojo/anaranjado #e8462e)
        secondary: {
          50: '#fce8e5',
          100: '#f8c6be',
          200: '#f3a093',
          300: '#e30613',
          400: '#ea5c47',
          500: '#e8462e', // tu color base
          600: '#e53f29',
          700: '#e23723',
          800: '#de2f1d',
          900: '#d82012',
        },
        // Color de acento (amarillo #f3e628)
        accent: {
          50: '#fefce6',
          100: '#fdf8c2',
          200: '#fcf399',
          300: '#fbed6d',
          400: '#f9e74c',
          500: '#f3e628', // tu color base
          600: '#e3d424',
          700: '#cfbe1e',
          800: '#bba818',
          900: '#988509',
        }
      },
      fontFamily: {
        primary: ['Bebas Neue', 'sans-serif'],
        secondary: ['Abel', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
  important: true,
};
