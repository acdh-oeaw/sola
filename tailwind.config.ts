import type { Config } from "tailwindcss";
import defaultTheme from 'tailwindcss/defaultTheme'
import colors from 'tailwindcss/colors'
import typographyPlugin from "@tailwindcss/typography"

function px(px: number): string {
  return `${px / 16}rem`
}

const config: Config = {
  content: ['./config/**/*.@(json)', './src/**/*.@(css|html|js|ts|tsx)'],
  plugins: [typographyPlugin],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
      },
      fontFamily: {
        body: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
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
        '-10': '-10',
      },
    },
    screens: {
      '2xs': '320px',
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1308px',
      '2xl': '1600px',
      '3xl': '1920px',
    },
  },
}

export default config
