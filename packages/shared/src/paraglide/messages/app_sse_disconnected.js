/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} App_Sse_DisconnectedInputs */

const en_app_sse_disconnected = /** @type {(inputs: App_Sse_DisconnectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Real-time connection lost. Reconnecting...`)
};

const es_app_sse_disconnected = /** @type {(inputs: App_Sse_DisconnectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se perdió la conexión en tiempo real. Reconectando...`)
};

/**
* | output |
* | --- |
* | "Real-time connection lost. Reconnecting..." |
*
* @param {App_Sse_DisconnectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const app_sse_disconnected = /** @type {((inputs?: App_Sse_DisconnectedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<App_Sse_DisconnectedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_app_sse_disconnected(inputs)
	return es_app_sse_disconnected(inputs)
});