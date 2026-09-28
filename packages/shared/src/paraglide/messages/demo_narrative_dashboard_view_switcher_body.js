/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_View_Switcher_BodyInputs */

const en_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The view switcher sets the view mode for every ticket section on the overview. The four view modes are table, rows, cards, and grid. The overview opens on cards. The tickets list keeps a separate view-mode preference that the overview does not follow. [View modes](#tickets/view-modes) covers the same four on the tickets list. [[#client-data]]
**Tickets shown per section.** Table, rows, and cards show five tickets per section. Grid shows six. The count beside a section heading can be higher than the number of tickets shown, because it reflects all tickets in the section. [[#client-data]]
**View-mode storage.** The selected view mode is saved in the browser's local storage under its own key. The app does not save it to an account record or include it in a request. The server cannot learn which view mode anyone uses. If the stored value is one the app does not recognize, the overview falls back to cards and the tickets list falls back to rows. If the browser refuses to save (private browsing and full storage are common reasons), the selected mode lasts until the tab or window closes. [[#privacy #server-holds]]
**Source file and storage keys.** \`packages/client/src/lib/stores/view-mode.svelte.ts\` holds one store per surface: the overview under \`care-y-dashboard-view-mode\` and the tickets list under \`care-y-view-mode\`. Both use the load-validate-write primitive in \`persisted-state.svelte.ts\`. The mode union includes a fifth value, \`kanban\`, which the tickets list offers as a placeholder. A stored copy of that value passes validation on both surfaces. [[#client-data]]`)
};

const es_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El selector de vista establece el modo de vista de cada sección de tickets en el resumen. Los cuatro modos de vista son tabla, filas, tarjetas y cuadrícula. El resumen se abre en tarjetas. La lista de tickets mantiene su propia preferencia de modo de vista, que el resumen no sigue. [Modos de vista](#tickets/view-modes) cubre los mismos cuatro en la lista de tickets. [[#client-data]]
**Tickets mostrados por sección.** Tabla, filas y tarjetas muestran cinco tickets por sección. Cuadrícula muestra seis. El número junto al encabezado de una sección puede ser mayor que la cantidad de tickets mostrados, porque refleja todos los tickets de la sección. [[#client-data]]
**Almacenamiento del modo de vista.** El modo de vista seleccionado se guarda en el almacenamiento local del navegador bajo su propia clave. La aplicación no lo guarda en un registro de cuenta ni lo incluye en una solicitud. El servidor no puede saber qué modo de vista usa cada persona. Si el valor almacenado no es uno que la aplicación reconozca, el resumen vuelve a tarjetas y la lista de tickets vuelve a filas. Si el navegador no permite guardar (la navegación privada y el almacenamiento lleno son razones comunes), el modo seleccionado dura hasta que se cierre la pestaña o la ventana. [[#privacy #server-holds]]
**Archivo fuente y claves de almacenamiento.** \`packages/client/src/lib/stores/view-mode.svelte.ts\` contiene un store por superficie: el resumen bajo \`care-y-dashboard-view-mode\` y la lista de tickets bajo \`care-y-view-mode\`. Ambos usan la primitiva de carga, validación y escritura en \`persisted-state.svelte.ts\`. La unión de modos incluye un quinto valor, \`kanban\`, que la lista de tickets ofrece como marcador de posición. Una copia almacenada de ese valor pasa la validación en ambas superficies. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè vìèw swìtchèr sèts thè vìèw mòdè fòr èvèry tìckèt sèctìòn òn thè òvèrvìèw. Thè fòùr vìèw mòdès àrè tàblè, ròws, càrds, ànd grìd. Thè òvèrvìèw òpèns òn càrds. Thè tìckèts lìst kèèps à sèpàràtè vìèw-mòdè prèfèrèncè thàt thè òvèrvìèw dòès nòt fòllòw. [Vìèw mòdès](#tìckèts/vìèw-mòdès) còvèrs thè sàmè fòùr òn thè tìckèts lìst. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Tìckèts shòwn pèr sèctìòn. ••••••••** Tàblè, ròws, ànd càrds shòw fìvè tìckèts pèr sèctìòn. Grìd shòws sìx. Thè còùnt bèsìdè à sèctìòn hèàdìng càn bè hìghèr thàn thè nùmbèr òf tìckèts shòwn, bècàùsè ìt rèflècts àll tìckèts ìn thè sèctìòn. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Vìèw-mòdè stòràgè. ••••••** Thè sèlèctèd vìèw mòdè ìs sàvèd ìn thè bròwsèr's lòcàl stòràgè ùndèr ìts òwn kèy. Thè àpp dòès nòt sàvè ìt tò àn àccòùnt rècòrd òr ìnclùdè ìt ìn à rèqùèst. Thè sèrvèr cànnòt lèàrn whìch vìèw mòdè ànyònè ùsès. Ìf thè stòrèd vàlùè ìs ònè thè àpp dòès nòt rècògnìzè, thè òvèrvìèw fàlls bàck tò càrds ànd thè tìckèts lìst fàlls bàck tò ròws. Ìf thè bròwsèr rèfùsès tò sàvè (prìvàtè bròwsìng ànd fùll stòràgè àrè còmmòn rèàsòns), thè sèlèctèd mòdè làsts ùntìl thè tàb òr wìndòw clòsès. [[#prìvàcy #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sòùrcè fìlè ànd stòràgè kèys. •••••••••** \`pàckàgès/clìènt/src/lìb/stòrès/vìèw-mòdè.svèltè.ts\` hòlds ònè stòrè pèr sùrfàcè: thè òvèrvìèw ùndèr \`càrè-y-dàshbòàrd-vìèw-mòdè\` ànd thè tìckèts lìst ùndèr \`càrè-y-vìèw-mòdè\`. Bòth ùsè thè lòàd-vàlìdàtè-wrìtè prìmìtìvè ìn \`pèrsìstèd-stàtè.svèltè.ts\`. Thè mòdè ùnìòn ìnclùdès à fìfth vàlùè, \`kànbàn\`, whìch thè tìckèts lìst òffèrs às à plàcèhòldèr. À stòrèd còpy òf thàt vàlùè pàssès vàlìdàtìòn òn bòth sùrfàcès. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The view switcher sets the view mode for every ticket section on the overview. The four view modes are table, rows, cards, and grid. The overview opens on ca..." |
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