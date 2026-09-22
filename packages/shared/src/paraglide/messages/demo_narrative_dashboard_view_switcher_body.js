/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_View_Switcher_BodyInputs */

const en_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The view switcher changes how every ticket section on the overview is presented, across four choices: table, rows, cards and grid. The overview opens on cards, and the tickets list keeps a preference of its own that the overview does not follow. [[#client-data]]
**How many tickets a section shows.** Table, rows and cards show five per section; grid shows six so its columns fill evenly. The count beside a section heading is not capped the same way, which is why a section can name more tickets than it lists. [[#client-data]]
**Where the choice is kept.** In the browser's own storage under a key of its own, never in an account record and never in a request, so the server learns nothing about how anyone reads the page. A stored value the app does not recognize falls back to rows, and a browser that refuses the write, which includes private browsing and full storage, keeps the choice for the session and forgets it afterward. [[#privacy #server-holds]]
**The store and its keys.** \`packages/client/src/lib/stores/view-mode.svelte.ts\` holds one store per surface, the overview under \`care-y-dashboard-view-mode\` and the tickets list under \`care-y-view-mode\`, both over the load-validate-write primitive in \`persisted-state.svelte.ts\`. The mode union carries a fifth value for a board view that no surface offers yet, and a stored copy of it would validate. [View modes](#tickets/view-modes) covers the same four on the tickets list. [[#client-data]]`)
};

const es_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El selector de vista cambia la presentación de todas las secciones de tickets del resumen, entre cuatro opciones: tabla, filas, tarjetas y cuadrícula. El resumen se abre en tarjetas, y la lista de tickets conserva una preferencia propia que el resumen no sigue. [[#client-data]]
**Cuántos tickets muestra una sección.** La tabla, las filas y las tarjetas muestran cinco por sección; la cuadrícula muestra seis para que sus columnas queden completas. El recuento que acompaña al encabezado de una sección no tiene ese mismo tope, y por eso una sección puede nombrar más tickets de los que enumera. [[#client-data]]
**Dónde se guarda la elección.** En el almacenamiento del propio navegador, bajo una clave propia, nunca en el registro de una cuenta y nunca en una petición, así que el servidor no aprende nada sobre cómo lee la página cada persona. Un valor almacenado que la aplicación no reconoce recae en las filas, y un navegador que rechaza la escritura, lo que incluye la navegación privada y el almacenamiento lleno, mantiene la elección durante la sesión y la olvida después. [[#privacy #server-holds]]
**El almacén y sus claves.** \`packages/client/src/lib/stores/view-mode.svelte.ts\` guarda un almacén por superficie, el resumen bajo \`care-y-dashboard-view-mode\` y la lista de tickets bajo \`care-y-view-mode\`, ambos sobre la primitiva de cargar, validar y escribir de \`persisted-state.svelte.ts\`. La unión de modos lleva un quinto valor para una vista de tablero que ninguna superficie ofrece todavía, y una copia almacenada de ese valor se daría por válida. [Modos de vista](#tickets/view-modes) trata esos mismos cuatro en la lista de tickets. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè vìèw swìtchèr ìn thè pàgè hèàdèr chàngès hòw tìckèt lìsts òn thè òvèrvìèw àrè dìsplàyèd. Fòùr mòdès àrè àvàìlàblè: tàblè, ròws, càrds, ànd grìd.
 •••••••••••••••••••••••••••••••••••••••••••••**Pèrsìstèncè. ••••** Thè sèlèctèd mòdè ìs sàvèd lòcàlly òn thè dèvìcè. Ìt àpplìès tò àll tìckèt sèctìòns òn thè òvèrvìèw pàgè ànd pèrsìsts bètwèèn sèssìòns. •••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The view switcher changes how every ticket section on the overview is presented, across four choices: table, rows, cards and grid. The overview opens on card..." |
*
* @param {Demo_Narrative_Dashboard_View_Switcher_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_view_switcher_body = /** @type {((inputs?: Demo_Narrative_Dashboard_View_Switcher_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_View_Switcher_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_view_switcher_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_view_switcher_body(inputs)
	return en_demo_narrative_dashboard_view_switcher_body(inputs)
});