/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_View_Modes_BodyInputs */

const en_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The ticket list has four view modes: table, compact rows, cards, and grid. [[#client-data]]
**What each mode requests.** Compact rows request no message preview. Cards and the grid load the most recent follow-ups for each ticket as it comes into view and decrypt them in the browser. The follow-up request names the tickets it asks about. All four modes decrypt the title. [[#metadata #server-holds]]
**The board mode.** A fifth mode is in development. It is a board grouped by stage and answers with a placeholder rather than a list. A preference stored while it was selected loads back unchanged. [[#failure-states]]
**Where the choice is stored.** The mode is saved in the browser's own storage and applies to the ticket list only. It is never in an account record and never in a request, so the server learns nothing about how anyone reads the page. A saved mode the app does not recognize falls back to compact rows. Saving the choice fails in private browsing windows and on devices with no storage space left. The mode then lasts until the user signs out or closes the browser, and is forgotten when either happens. [The view switcher](#dashboard/view-switcher) covers the separate preference the overview keeps. [[#privacy #server-holds]]
**The mode store and the two virtualizers.** \`packages/client/src/lib/stores/view-mode.svelte.ts\` holds the ticket list mode under \`care-y-view-mode\`. Rendering splits by mode. The table windows its rows by dividing the scroll position by a uniform row pitch in \`packages/client/src/lib/components/tickets/ticket-table-window.ts\`. The other three modes measure each card through \`VirtualList.svelte\`. \`VirtualList.svelte\` starts virtualizing past two hundred rows and lays the grid out at no fewer than two columns. [[#client-data]]`)
};

const es_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de tickets tiene cuatro modos de vista: tabla, filas compactas, tarjetas y cuadrícula. [[#client-data]]
**Qué pide cada modo.** Las filas compactas no piden ninguna vista previa de mensajes. Las tarjetas y la cuadrícula cargan los últimos seguimientos de cada ticket a medida que aparece a la vista y los descifran en el navegador. La petición de seguimientos nombra los tickets por los que pregunta. Los cuatro modos descifran el título. [[#metadata #server-holds]]
**El modo de tablero.** Un quinto modo está en desarrollo. Es un tablero agrupado por etapa y responde con un marcador en lugar de una lista. Una preferencia guardada mientras estaba seleccionado se vuelve a cargar sin cambios. [[#failure-states]]
**Dónde se guarda la elección.** El modo se guarda en el almacenamiento del propio navegador y solo se aplica a la lista de tickets. Nunca está en el registro de una cuenta ni en una petición, así que el servidor no aprende nada sobre cómo lee la página cada persona. Un modo guardado que la aplicación no reconoce recae en las filas compactas. Guardar la elección falla en las ventanas de navegación privada y en los dispositivos sin espacio de almacenamiento libre. El modo dura entonces hasta que la persona usuaria cierra sesión o cierra el navegador, y se olvida en cuanto ocurre cualquiera de las dos cosas. [El selector de vista](#dashboard/view-switcher) trata la preferencia aparte que guarda el resumen. [[#privacy #server-holds]]
**El almacén de modos y los dos virtualizadores.** \`packages/client/src/lib/stores/view-mode.svelte.ts\` guarda el modo de la lista de tickets bajo \`care-y-view-mode\`. La representación se reparte por modo. La tabla acota sus filas dividiendo la posición de desplazamiento entre un paso de fila uniforme, en \`packages/client/src/lib/components/tickets/ticket-table-window.ts\`. Los otros tres modos miden cada tarjeta con \`VirtualList.svelte\`. \`VirtualList.svelte\` empieza a virtualizar a partir de doscientas filas y dispone la cuadrícula en dos columnas como mínimo. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tìckèt lìst hàs fòùr vìèw mòdès: tàblè, còmpàct ròws, càrds, ànd grìd. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••**Whàt èàch mòdè rèqùèsts. ••••••••** Còmpàct ròws rèqùèst nò mèssàgè prèvìèw. Càrds ànd thè grìd lòàd thè mòst rècènt fòllòw-ùps fòr èàch tìckèt às ìt còmès ìntò vìèw ànd dècrypt thèm ìn thè bròwsèr. Thè fòllòw-ùp rèqùèst nàmès thè tìckèts ìt àsks àbòùt. Àll fòùr mòdès dècrypt thè tìtlè. [[#mètàdàtà #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè bòàrd mòdè. •••••** À fìfth mòdè ìs ìn dèvèlòpmènt. Ìt ìs à bòàrd gròùpèd by stàgè ànd ànswèrs wìth à plàcèhòldèr ràthèr thàn à lìst. À prèfèrèncè stòrèd whìlè ìt wàs sèlèctèd lòàds bàck ùnchàngèd. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèrè thè chòìcè ìs stòrèd. •••••••••** Thè mòdè ìs sàvèd ìn thè bròwsèr's òwn stòràgè ànd àpplìès tò thè tìckèt lìst ònly. Ìt ìs nèvèr ìn àn àccòùnt rècòrd ànd nèvèr ìn à rèqùèst, sò thè sèrvèr lèàrns nòthìng àbòùt hòw ànyònè rèàds thè pàgè. À sàvèd mòdè thè àpp dòès nòt rècògnìzè fàlls bàck tò còmpàct ròws. Sàvìng thè chòìcè fàìls ìn prìvàtè bròwsìng wìndòws ànd òn dèvìcès wìth nò stòràgè spàcè lèft. Thè mòdè thèn làsts ùntìl thè ùsèr sìgns òùt òr clòsès thè bròwsèr, ànd ìs fòrgòttèn whèn èìthèr hàppèns. [Thè vìèw swìtchèr](#dàshbòàrd/vìèw-swìtchèr) còvèrs thè sèpàràtè prèfèrèncè thè òvèrvìèw kèèps. [[#prìvàcy #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè mòdè stòrè ànd thè twò vìrtùàlìzèrs. ••••••••••••** \`pàckàgès/clìènt/src/lìb/stòrès/vìèw-mòdè.svèltè.ts\` hòlds thè tìckèt lìst mòdè ùndèr \`càrè-y-vìèw-mòdè\`. Rèndèrìng splìts by mòdè. Thè tàblè wìndòws ìts ròws by dìvìdìng thè scròll pòsìtìòn by à ùnìfòrm ròw pìtch ìn \`pàckàgès/clìènt/src/lìb/còmpònènts/tìckèts/tìckèt-tàblè-wìndòw.ts\`. Thè òthèr thrèè mòdès mèàsùrè èàch càrd thròùgh \`VìrtùàlLìst.svèltè\`. \`VìrtùàlLìst.svèltè\` stàrts vìrtùàlìzìng pàst twò hùndrèd ròws ànd làys thè grìd òùt àt nò fèwèr thàn twò còlùmns. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The ticket list has four view modes: table, compact rows, cards, and grid. [[#client-data]] **What each mode requests.** Compact rows request no message prev..." |
*
* @param {Demo_Narrative_Topic_View_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_view_modes_body = /** @type {((inputs?: Demo_Narrative_Topic_View_Modes_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_View_Modes_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_view_modes_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_view_modes_body(inputs)
	return en_demo_narrative_topic_view_modes_body(inputs)
});