import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/CueCal/markdown-page',
    component: ComponentCreator('/CueCal/markdown-page', 'f45'),
    exact: true
  },
  {
    path: '/CueCal/docs',
    component: ComponentCreator('/CueCal/docs', '9cc'),
    routes: [
      {
        path: '/CueCal/docs',
        component: ComponentCreator('/CueCal/docs', '64f'),
        routes: [
          {
            path: '/CueCal/docs',
            component: ComponentCreator('/CueCal/docs', '65f'),
            routes: [
              {
                path: '/CueCal/docs/intro',
                component: ComponentCreator('/CueCal/docs/intro', '415'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/CueCal/docs/tutorial-basics/direct-installation',
                component: ComponentCreator('/CueCal/docs/tutorial-basics/direct-installation', 'b9e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/CueCal/docs/tutorial-basics/docker-installation',
                component: ComponentCreator('/CueCal/docs/tutorial-basics/docker-installation', '431'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/CueCal/docs/tutorial-basics/installation',
                component: ComponentCreator('/CueCal/docs/tutorial-basics/installation', '9be'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/CueCal/',
    component: ComponentCreator('/CueCal/', '49e'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
