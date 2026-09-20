/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Route_LoadingInputs */

const en_demo_route_loading = /** @type {(inputs: Demo_Route_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`One moment, loading this screen. This short wait happens only in the handbook simulator, not in the installed app.`)
};

const es_demo_route_loading = /** @type {(inputs: Demo_Route_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un momento, cargando esta pantalla. Esta breve espera ocurre solo en el simulador del manual, no en la aplicación instalada.`)
};

const en_xa2_demo_route_loading = /** @type {(inputs: Demo_Route_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ònè mòmènt, lòàdìng thìs scrèèn. Thìs shòrt wàìt hàppèns ònly ìn thè hàndbòòk sìmùlàtòr, nòt ìn thè ìnstàllèd àpp. •••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "One moment, loading this screen. This short wait happens only in the handbook simulator, not in the installed app." |
*
* @param {Demo_Route_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_route_loading = /** @type {((inputs?: Demo_Route_LoadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Route_LoadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_route_loading(inputs)
	if (locale === "en-XA") return en_xa2_demo_route_loading(inputs)
	return en_demo_route_loading(inputs)
});