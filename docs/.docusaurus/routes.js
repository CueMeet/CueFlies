import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '491'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '165'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '2a0'),
            routes: [
              {
                path: '/configuration',
                component: ComponentCreator('/configuration', '3cd'),
                exact: true
              },
              {
                path: '/getting-started',
                component: ComponentCreator('/getting-started', 'ac2'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/guide/basic-features',
                component: ComponentCreator('/guide/basic-features', 'f5f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/meeting-bot',
                component: ComponentCreator('/meeting-bot', '1de'),
                exact: true
              },
              {
                path: '/',
                component: ComponentCreator('/', 'bea'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
