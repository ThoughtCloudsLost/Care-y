/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Dashboard_DescInputs */

const en_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The home screen shows recent activity and queue counts. The activity feed and statistics pull real data from the in-browser database. The shift summary card shows placeholder data (scheduling is not built yet).`)
};

const es_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pantalla de inicio muestra la actividad reciente y los conteos por cola. El feed de actividad y las estadisticas obtienen datos reales de la base de datos del navegador. La tarjeta de turno muestra datos de ejemplo (la programacion aun no esta construida).`)
};

/**
* | output |
* | --- |
* | "The home screen shows recent activity and queue counts. The activity feed and statistics pull real data from the in-browser database. The shift summary card ..." |
*
* @param {Demo_Section_Dashboard_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_dashboard_desc = /** @type {((inputs?: Demo_Section_Dashboard_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Dashboard_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_dashboard_desc(inputs)
	return es_demo_section_dashboard_desc(inputs)
});