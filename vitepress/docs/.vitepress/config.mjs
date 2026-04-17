import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LockdIn²',
  description: 'The collaborative study platform — lock in, level up.',
  lang: 'en-US',
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap', rel: 'stylesheet' }],
  ],

  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: false,

    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'About',
        items: [
          { text: 'About LockdIn²', link: '/about/lockdin' },
          { text: 'Contributors', link: '/about/contributors' },
        ]
      },
      { text: 'Features', link: '/features' },
      { text: 'Promo Video', link: '/promo-video' },
      { text: 'How to Run', link: '/how-to-run' },
    ],

    // Sidebar shown on all pages except home
    sidebar: [
      {
        text: 'About',
        collapsed: false,
        items: [
          { text: 'About LockdIn²', link: '/about/lockdin' },
          { text: 'Contributors', link: '/about/contributors' },
        ]
      },
      { text: '✨ Features', link: '/features' },
      { text: '🎬 Promo Video', link: '/promo-video' },
      { text: '🚀 How to Run', link: '/how-to-run' },
    ],

    footer: {
      message: 'Built with 💜 by the LockdIn Team',
      copyright: 'LockdIn² — A collaborative study platform'
    }
  }
})