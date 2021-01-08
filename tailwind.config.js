const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

/**
 * Converts pixel to rem.
 */
function px(px) {
  return `${px / 16}rem`
}

module.exports = {
  purge: [
    'src/**/*.@(css|html|js|jsx|ts|tsx)',
    'stories/**/*.@(css|html|js|jsx|ts|tsx)',
  ],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
      },
      fontFamily: {
        body: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        sm: px(13),
        base: px(15),
      },
      maxWidth: {
        '65ch': '65ch',
        '80ch': '80ch',
      },
      zIndex: {
        '-10': -10,
      },
    },
    screens: {
      '2xs': '320px',
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1600px',
      '3xl': '1920px',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
