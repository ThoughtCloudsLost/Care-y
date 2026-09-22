/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_View_Modes_BodyInputs */

const en_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The tickets list presents the same rows four ways, as a table, as compact rows, as cards and as a grid. [[#client-data]]
**What each presentation asks the server for.** Compact rows request no message preview. Cards and the grid load the most recent follow-ups for each ticket as it comes into the rendered range and decrypt them in the browser, so choosing one of those two asks for follow-up ciphertext the other two never request, and the request names the tickets on their way through. All four decrypt the title. [[#metadata #server-holds]]
**The board view.** A fifth choice, a board grouped by stage, is in development and answers with a placeholder rather than a list. A preference stored while it was selected loads back unchanged. [[#failure-states]]
**Where the choice is kept.** In the browser's own storage under a key belonging to this list alone, never in an account record and never in a request, so the server learns nothing about how anyone reads the page. A stored value the app does not recognize falls back to compact rows, and a browser that refuses the write, which includes private browsing and full storage, keeps the choice for the session and forgets it afterward. [The view switcher](#dashboard/view-switcher) covers the separate preference the overview keeps. [[#privacy #server-holds]]
**The mode store and the two virtualizers.** \`packages/client/src/lib/stores/view-mode.svelte.ts\` holds the tickets list under \`care-y-view-mode\`. Rendering splits by mode, with the table windowing its rows by dividing the scroll position by a uniform row pitch in \`packages/client/src/lib/components/tickets/ticket-table-window.ts\` and the other three measuring each card through \`VirtualList.svelte\`, which starts virtualizing past two hundred rows and lays the grid out at no fewer than two columns. [[#client-data]]`)
};

const es_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de tickets presenta las mismas filas de cuatro maneras, como tabla, como filas compactas, como tarjetas y como cuadrícula. [[#client-data]]
**Qué le pide al servidor cada presentación.** Las filas compactas no piden ninguna vista previa de mensajes. Las tarjetas y la cuadrícula cargan los últimos seguimientos de cada ticket a medida que entra en el rango representado y los descifran en el navegador, de modo que elegir una de esas dos pide texto cifrado de seguimientos que las otras dos nunca solicitan, y la petición nombra los tickets a su paso. Las cuatro descifran el título. [[#metadata #server-holds]]
**La vista de tablero.** Una quinta opción, un tablero agrupado por etapa, está en desarrollo y responde con un marcador en lugar de una lista. Una preferencia guardada mientras estaba seleccionada se vuelve a cargar sin cambios. [[#failure-states]]
**Dónde se guarda la elección.** En el almacenamiento del propio navegador, bajo una clave que pertenece solo a esta lista, nunca en el registro de una cuenta y nunca en una petición, así que el servidor no aprende nada sobre cómo lee la página cada persona. Un valor almacenado que la aplicación no reconoce recae en las filas compactas, y un navegador que rechaza la escritura, lo que incluye la navegación privada y el almacenamiento lleno, mantiene la elección durante la sesión y la olvida después. [El selector de vista](#dashboard/view-switcher) trata la preferencia aparte que guarda el resumen. [[#privacy #server-holds]]
**El almacén de modos y los dos virtualizadores.** \`packages/client/src/lib/stores/view-mode.svelte.ts\` guarda la lista de tickets bajo \`care-y-view-mode\`. La representación se reparte por modo, con la tabla acotando sus filas al dividir la posición de desplazamiento entre un paso de fila uniforme, en \`packages/client/src/lib/components/tickets/ticket-table-window.ts\`, y las otras tres midiendo cada tarjeta con \`VirtualList.svelte\`, que empieza a virtualizar a partir de doscientas filas y dispone la cuadrícula en dos columnas como mínimo. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tìckèt lìst sùppòrts fìvè làyòùt òptìòns.
-  •••••••••••••••**Tàblè ••** prèsènts tìckèts ìn à sòrtàblè dàtà tàblè wìth còlùmns fòr èàch fìèld
-  ••••••••••••••••••••••**Ròws ••** shòw còmpàct sìnglè lìnè èntrìès wìth stàtùs ìndìcàtòrs
-  ••••••••••••••••••**Càrds ••** shòw èàch tìckèt wìth à mèssàgè prèvìèw bùbblè fòr mòrè còntèxt
-  •••••••••••••••••••••**Grìd ••** àrràngès tìckèts ìn à grìd òf smàllèr còmpàct càrds
-  •••••••••••••••••**Kànbàn ••** (còmìng sòòn) wìll gròùp tìckèts ìntò swìmlànès by stàtùs
 ••••••••••••••••••**Pèrsìstèncè. ••••** Thè sèlèctèd mòdè ìs sàvèd lòcàlly ànd pèrsìsts bètwèèn sèssìòns. Thè òvèrvìèw pàgè hàs ìts òwn vìèw mòdè prèfèrèncè stòrèd sèpàràtèly, ànd ìt dòès nòt ìnclùdè thè Kànbàn òptìòn. ••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The tickets list presents the same rows four ways, as a table, as compact rows, as cards and as a grid. [[#client-data]] **What each presentation asks the se..." |
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