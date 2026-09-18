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

/**
* | output |
* | --- |
* | "The view switcher in the page header changes how ticket lists on the overview are displayed. Four modes are available: table, rows, cards, and grid. **Persis..." |
*
* @param {Demo_Narrative_Dashboard_View_Switcher_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_view_switcher_body = /** @type {((inputs?: Demo_Narrative_Dashboard_View_Switcher_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_View_Switcher_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_view_switcher_body(inputs)
	return en_demo_narrative_dashboard_view_switcher_body(inputs)
});