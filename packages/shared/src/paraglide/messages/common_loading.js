/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_LoadingInputs */

const en_common_loading = /** @type {(inputs: Common_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading`)
};

const es_common_loading = /** @type {(inputs: Common_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando`)
};

const en_xa2_common_loading = /** @type {(inputs: Common_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàdìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Loading" |
*
* @param {Common_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const common_loading = /** @type {((inputs?: Common_LoadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_LoadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_common_loading(inputs)
	if (locale === "en-XA") return en_xa2_common_loading(inputs)
	return en_common_loading(inputs)
});