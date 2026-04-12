/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Decrypt_Placeholder_LoadingInputs */

const en_decrypt_placeholder_loading = /** @type {(inputs: Decrypt_Placeholder_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Decrypting`)
};

const es_decrypt_placeholder_loading = /** @type {(inputs: Decrypt_Placeholder_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descifrando`)
};

/**
* | output |
* | --- |
* | "Decrypting" |
*
* @param {Decrypt_Placeholder_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const decrypt_placeholder_loading = /** @type {((inputs?: Decrypt_Placeholder_LoadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Decrypt_Placeholder_LoadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_decrypt_placeholder_loading(inputs)
	return es_decrypt_placeholder_loading(inputs)
});