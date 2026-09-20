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

const en_xa2_app_sse_disconnected = /** @type {(inputs: App_Sse_DisconnectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèàl-tìmè cònnèctìòn lòst. Rècònnèctìng... •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Real-time connection lost. Reconnecting..." |
*
* @param {App_Sse_DisconnectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const app_sse_disconnected = /** @type {((inputs?: App_Sse_DisconnectedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<App_Sse_DisconnectedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_app_sse_disconnected(inputs)
	if (locale === "en-XA") return en_xa2_app_sse_disconnected(inputs)
	return en_app_sse_disconnected(inputs)
});