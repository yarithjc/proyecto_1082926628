const config = {
  plugins: {
    "@tailwindcss/nesting": {},
    "@tailwindcss/postcss": {
      corePlugins: {
        preflight: true,
      },
    },
  },
};

export default config;
