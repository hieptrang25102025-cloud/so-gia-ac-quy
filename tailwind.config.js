/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#A91F2C',       // Đỏ đô nhận diện chính
          ruby: '#C93642',       // Đỏ ruby nút bấm & điểm nhấn
          pink: '#F5CBCD',       // Hồng phấn nền card giá
          pinkLight: '#FFF5F2',  // Trắng hồng nền app
          cream: '#FAF3F0',      // Trắng kem nền phụ
          charcoal: '#49383A',   // Nâu than màu chữ chính
          subtle: '#8C7779',     // Màu chữ phụ
          border: '#EED9D7',     // Viền mềm mại
        },
        supplier: {
          nguyen: {
            DEFAULT: '#C93642',
            light: '#FDECEE',
            text: '#8E1722',
            border: '#F7B4BB'
          },
          ngoc: {
            DEFAULT: '#E06D10',
            light: '#FFF2E6',
            text: '#A64805',
            border: '#F8C89F'
          },
          nhung: {
            DEFAULT: '#7B3FA8',
            light: '#F5ECFA',
            text: '#58217E',
            border: '#D8B3F2'
          }
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 14px 0 rgba(169, 31, 44, 0.08)',
        'card-hover': '0 8px 22px 0 rgba(169, 31, 44, 0.14)',
        'button': '0 6px 18px 0 rgba(201, 54, 66, 0.35)',
        'bottom-nav': '0 -4px 20px 0 rgba(73, 56, 58, 0.06)',
      }
    },
  },
  plugins: [],
}
