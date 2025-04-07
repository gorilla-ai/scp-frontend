import Welcome from 'components/welcome';
import Loadable from './loadable';

export default [{
  path: '/',
  exact: true,
  component: Welcome
}, {
  path: '/standard',
  text: 'Standard',
  component: Loadable({ loader: () => import('components/standard') })
}, {
  path: '/track',
  text: 'Track',
  component: Loadable({ loader: () => import('components/track') })
}, {
  path: '/heatmap',
  text: 'Heatmap',
  component: Loadable({ loader: () => import('components/heatmap') })
}, {
  path: '/contour',
  text: 'Contour',
  component: Loadable({ loader: () => import('components/contour') })
}, {
  path: '/draw',
  text: 'Draw',
  component: Loadable({ loader: () => import('components/draw') })
}, {
  path: '/overlay',
  text: 'Overlay',
  component: Loadable({ loader: () => import('components/overlay') })
}];
