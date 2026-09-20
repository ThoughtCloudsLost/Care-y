/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_View_Switcher_BodyInputs */

const en_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The view switcher in the page header changes how ticket lists on the overview are displayed. Four modes are available: table, rows, cards, and grid.
**Persistence.** The selected mode is saved locally on the device. It applies to all ticket sections on the overview page and persists between sessions.`)
};

const es_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El selector de vista en el encabezado de la página cambia cómo se muestran las listas de tickets en el resumen. Hay cuatro modos disponibles: tabla, filas, tarjetas y cuadrícula.
**Persistencia.** El modo seleccionado se guarda localmente en el dispositivo. Se aplica a todas las secciones de tickets de la página de resumen y persiste entre sesiones.`)
};

const en_xa2_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè vìèw swìtchèr ìn thè pàgè hèàdèr chàngès hòw tìckèt lìsts òn thè òvèrvìèw àrè dìsplàyèd. Fòùr mòdès àrè àvàìlàblè: tàblè, ròws, càrds, ànd grìd.
 •••••••••••••••••••••••••••••••••••••••••••••**Pèrsìstèncè. ••••** Thè sèlèctèd mòdè ìs sàvèd lòcàlly òn thè dèvìcè. Ìt àpplìès tò àll tìckèt sèctìòns òn thè òvèrvìèw pàgè ànd pèrsìsts bètwèèn sèssìòns. •••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The view switcher in the page header changes how ticket lists on the overview are displayed. Four modes are available: table, rows, cards, and grid. **Persis..." |
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