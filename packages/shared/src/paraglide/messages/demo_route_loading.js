/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Route_LoadingInputs */

const en_demo_route_loading = /** @type {(inputs: Demo_Route_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`One moment, loading this screen. This short wait happens only in the handbook, not in the installed app.`)
};

const es_demo_route_loading = /** @type {(inputs: Demo_Route_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un momento, cargando esta pantalla. Esta breve espera ocurre solo en el manual, no en la aplicación instalada.`)
};

/**
* | output |
* | --- |
* | "One moment, loading this screen. This short wait happens only in the handbook, not in the installed app." |
*
* @param {Demo_Route_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_route_loading = /** @type {((inputs?: Demo_Route_LoadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Route_LoadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_route_loading(inputs)
	return es_demo_route_loading(inputs)
});