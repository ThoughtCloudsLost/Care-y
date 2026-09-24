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

const en_xa2_app_offline = /** @type {(inputs: App_OfflineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù àrè òfflìnè. Sòmè fèàtùrès àrè ùnàvàìlàblè. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You are offline. Some features are unavailable." |
*
* @param {App_OfflineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const app_offline = /** @type {((inputs?: App_OfflineInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<App_OfflineInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_app_offline(inputs)
	if (locale === "en-XA") return en_xa2_app_offline(inputs)
	return en_app_offline(inputs)
});