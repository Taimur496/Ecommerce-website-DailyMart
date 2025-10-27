import purgecssModule from "@fullhuman/postcss-purgecss";
const purgecss = purgecssModule.default;

export default {
  plugins: [
    purgecss({
      content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: [
          /^slick-/,
          /^fa-/,
          /^Toastify/,
          /^modal-/,

          /^btn-/,

          /^alert-/,
          /^badge-/,
          /^bg-/,
          /^text-/,
        ],
        greedy: [/^carousel/, /^tooltip/, /^popover/],
      },
    }),
  ],
};
