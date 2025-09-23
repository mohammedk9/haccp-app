import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const postcssConfig = {
  plugins: [
    tailwindcss(),   // استدعاء الدالة
    autoprefixer(),  // استدعاء الدالة
  ],
};

export default postcssConfig;

