import Stylis from 'stylis';

const styleID = 'gis-basic-css';
const csstext = Stylis('', `
  .gis-point {
    fill: #FF7800;
    color: #000;
    weight: 1;
    opacity: 1;
  }

  .gis-vertex {
    background-color: rgba(255, 255, 255, 0.7);
    border: 10px solid #3388FF;
    border-radius: 50%;
  }

  .gis-measure-hint {
    background: rgba(0, 0, 0, 0.7);
    color: #FFFFFF;
    left: 0;
    margin: 0 auto;
    position: absolute;
    right: 0;
    text-align: center;
    width: 20%;
    z-index: 800;
  }

  .leaflet-marker-icon.gis-divIcon {
    align-items: center;
    display: flex;
    flex-direction: column;

    > img {
      flex-grow: 1;
      max-height: 100% !important;
      max-width: 100% !important;
      position: initial;
    }

    > div.gis-spot {
      background-color: #008FCF;
      border-radius: 50%;
      display: block;
      margin-bottom: 5px;
      position: initial;

      &:after {
        content: ' ';
        display: block;
        height: 100%;
        width: 100%;
      }

      &.center-text{
        display: grid;
        align-content: center;
        justify-content: center;
        span{
          font-weight: bold;
        }
      }
    }

    > span.gis-label {
        flex-grow: 0;
        position: initial;
        text-align: center;
        width: 60px !important;
        word-break: break-word;
    }
  }

  /* Maker pane's z-index = 600 */
  .leaflet-pane.leaflet-track-pane {
    z-index: 601;
  }

  .js-top-layer {
    z-index: 2147483647 !important;
  }
`);

export default function() {
  if (!document.getElementById(styleID)) {
    const style = document.createElement('style');
  
    (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
  
    style.id = 'gis-styles';
    style.type = 'text/css';
  
    if (style.styleSheet)
      style.styleSheet.cssText = csstext;
    else
      style.appendChild(document.createTextNode(csstext));
  }
}
