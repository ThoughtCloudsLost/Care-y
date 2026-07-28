/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_BodyInputs */

const en_demo_narrative_dashboard_body = /** @type {(inputs: Demo_Narrative_Dashboard_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`After login, volunteers land on the dashboard. It shows recent ticket activity, open counts per queue, and a shift summary. Activity and counts come from the encrypted database running in your browser. The shift card is a static preview of a feature still in development.`)
};

const es_demo_narrative_dashboard_body = /** @type {(inputs: Demo_Narrative_Dashboard_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Despues de iniciar sesion, los voluntarios llegan al panel principal. Muestra la actividad reciente de tickets, conteos abiertos por cola y un resumen de turno. La actividad y los conteos provienen de la base de datos cifrada que corre en tu navegador. La tarjeta de turno es una vista previa de una funcion aun en desarrollo.`)
};

/**
* | output |
* | --- |
* | "After login, volunteers land on the dashboard. It shows recent ticket activity, open counts per queue, and a shift summary. Activity and counts come from the..." |
*
* @param {Demo_Narrative_Dashboard_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_body = /** @type {((inputs?: Demo_Narrative_Dashboard_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_body(inputs)
	return es_demo_narrative_dashboard_body(inputs)
});