<!--
  Hidden SVG containing the riso-ink filter definition.
  Rendered once in the root layout. Components reference via filter: url(#riso-ink)
-->
<svg
  width="0"
  height="0"
  aria-hidden="true"
  style="position: absolute; pointer-events: none;"
>
  <defs>
    <!-- prettier-ignore -->
    <filter id="riso-ink" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix"
        values="1.2 0 0 0 0  0 0.3 0 0 0  0 0 0.2 0 0  0 0 0 0.4 0" result="warm"/>
      <feOffset in="warm" dx="1.5" dy="1.0" result="warmOff"/>
      <feColorMatrix in="SourceGraphic" type="matrix"
        values="0.2 0 0 0 0  0 0.4 0 0 0  0 0 1.1 0 0  0 0 0 0.3 0" result="cool"/>
      <feOffset in="cool" dx="-1.0" dy="-0.6" result="coolOff"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="1" seed="4" result="noise"/>
      <feDisplacementMap in="warmOff" in2="noise" scale="0.6"
        xChannelSelector="R" yChannelSelector="G" result="warmDisp"/>
      <feGaussianBlur in="warmDisp" stdDeviation="0.8" result="warmBlur"/>
      <feDisplacementMap in="coolOff" in2="noise" scale="0.6"
        xChannelSelector="G" yChannelSelector="B" result="coolDisp"/>
      <feGaussianBlur in="coolDisp" stdDeviation="0.8" result="coolBlur"/>
      <feBlend in="warmBlur" in2="coolBlur" mode="screen" result="inks"/>
      <feComposite in="SourceGraphic" in2="inks" operator="over" result="final"/>
      <feColorMatrix type="saturate" values="1.1"/>
    </filter>
  </defs>
</svg>
