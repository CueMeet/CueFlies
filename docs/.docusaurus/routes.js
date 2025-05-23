import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/CueFlies/markdown-page',
    component: ComponentCreator('/CueFlies/markdown-page', 'f45'),
    exact: true
  },
  {
    path: '/CueFlies/docs',
    component: ComponentCreator('/CueFlies/docs', '9cc'),
    routes: [
      {
        path: '/CueFlies/docs',
        component: ComponentCreator('/CueFlies/docs', '64f'),
        routes: [
          {
            path: '/CueFlies/docs',
            component: ComponentCreator('/CueFlies/docs', '65f'),
            routes: [
              {
                path: '/CueFlies/docs/intro',
                component: ComponentCreator('/CueFlies/docs/intro', '415'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/CueFlies/docs/tutorial-basics/direct-installation',
                component: ComponentCreator('/CueFlies/docs/tutorial-basics/direct-installation', 'b9e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/CueFlies/docs/tutorial-basics/docker-installation',
                component: ComponentCreator('/CueFlies/docs/tutorial-basics/docker-installation', '431'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/CueFlies/docs/tutorial-basics/installation',
                component: ComponentCreator('/CueFlies/docs/tutorial-basics/installation', '9be'),
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
    path: '/CueFlies/',
    component: ComponentCreator('/CueFlies/', '49e'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
