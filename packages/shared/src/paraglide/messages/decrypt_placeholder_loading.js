/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Decrypt_Placeholder_LoadingInputs */

const en_decrypt_placeholder_loading = /** @type {(inputs: Decrypt_Placeholder_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlocking`)
};

const es_decrypt_placeholder_loading = /** @type {(inputs: Decrypt_Placeholder_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desbloqueando`)
};

const en_xa2_decrypt_placeholder_loading = /** @type {(inputs: Decrypt_Placeholder_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnlòckìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Unlocking" |
*
* @param {Decrypt_Placeholder_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const decrypt_placeholder_loading = /** @type {((inputs?: Decrypt_Placeholder_LoadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Decrypt_Placeholder_LoadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_decrypt_placeholder_loading(inputs)
	if (locale === "en-XA") return en_xa2_decrypt_placeholder_loading(inputs)
	return en_decrypt_placeholder_loading(inputs)
});