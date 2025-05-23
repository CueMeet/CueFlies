// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CueFlies Documentation',
  tagline: 'Open Source Calendar and Meeting Management System',
  favicon: 'img/logo.png',

  // Set the production url of your site here
  url: 'https://CueFlies.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config
  organizationName: 'CueMeet',
  projectName: 'CueFlies',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/CueMeet/CueFlies/edit/main/docs/',
          routeBasePath: '/', // Serve the docs at the site's root
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/CueMeet/CueFlies/edit/main/docs/blog/',
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'CueFlies',
        logo: {
          alt: 'CueFlies Logo',
          src: 'img/logo.png',
        },
        items: [] // Remove all links, only show logo and title
      },
      // footer: {
      //   style: 'dark',
      //   links: [
      //     {
      //       title: 'Docs',
      //       items: [
      //         {
      //           label: 'Getting Started',
      //           to: '/',
      //         },
      //         {
      //           label: 'Docker Installation',
      //           to: '/docker-installation',
      //         },
      //         {
      //           label: 'Direct Installation',
      //           to: '/direct-installation',
      //         },
      //       ],
      //     },
      //     {
      //       title: 'Community',
      //       items: [
      //         {
      //           label: 'GitHub',
      //           href: 'https://github.com/CueMeet/CueFlies',
      //         }
      //       ],
      //     },
      //   ],
      //   copyright: `Copyright © ${new Date().getFullYear()} CueFlies. Built with Docusaurus.`,
      // },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;