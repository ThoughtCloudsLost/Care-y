/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} App_OfflineInputs */

const en_app_offline = /** @type {(inputs: App_OfflineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You are offline. Some features are unavailable.`)
};

const es_app_offline = /** @type {(inputs: App_OfflineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay conexión. Algunas funciones no están disponibles.`)
};

/**
* | output |
* | --- |
* | "You are offline. Some features are unavailable." |
*
* @param {App_OfflineInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const app_offline = /** @type {((inputs?: App_OfflineInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<App_OfflineInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_app_offline(inputs)
	return es_app_offline(inputs)
});