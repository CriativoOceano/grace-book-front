/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Antes eram um azul/cinza genéricos do template do Tailwind, sem
        // nenhuma relação com a marca real (--azul-abissal/--dourado-presenca
        // em styles.scss) — e por isso praticamente nunca eram usados;
        // quem precisava de cor ia direto num blue-600/etc. do Tailwind
        // padrão, fora da paleta da marca (ver payment-success). Agora
        // "primary"/"secondary" são a escala da marca de verdade.
        primary: {
          50: '#eef3f8',
          100: '#d3e1ec',
          200: '#a7c3d9',
          300: '#7ba5c6',
          400: '#4f87b3',
          500: '#2e6b98',
          600: '#16537c',
          700: '#0a2647', // = --azul-abissal
          800: '#081d38',
          900: '#051428',
        },
        secondary: {
          50: '#fbf5e9',
          100: '#f6ebd9', // = --areia-sereno
          200: '#edd7a8',
          300: '#e4c481',
          400: '#d9b05c',
          500: '#cba135', // = --dourado-presenca
          600: '#b38e2e', // = --dourado-hover
          700: '#8c701f',
          800: '#6b5518',
          900: '#4a3b10',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        // O site inteiro usa Playfair Display nos títulos via
        // font-family direto no SCSS de cada componente — menos em duas
        // páginas (booking, payment-success) que usam a utility
        // `font-serif` do Tailwind e por isso caem no serif genérico
        // padrão dele. Isso resolve a inconsistência sem precisar tocar
        // nos templates.
        'serif': ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
