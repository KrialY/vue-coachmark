import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue Coachmark",
  description: "Vue Coachmark desc",
  base: '/vue-coachmark/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/coachmark' }
    ],
    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Basic usage', link: '/coachmark' },
          { text: 'Auto scroll', link: '/autoScroll' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/KrialY/vue-coachmark' }
    ]
  }
})
