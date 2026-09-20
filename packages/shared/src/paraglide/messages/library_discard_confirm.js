/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Discard_ConfirmInputs */

const en_library_discard_confirm = /** @type {(inputs: Library_Discard_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Discard`)
};

const es_library_discard_confirm = /** @type {(inputs: Library_Discard_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descartar`)
};

const en_xa2_library_discard_confirm = /** @type {(inputs: Library_Discard_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìscàrd •••⟧`)
};

/**
* | output |
* | --- |
* | "Discard" |
*
* @param {Library_Discard_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_discard_confirm = /** @type {((inputs?: Library_Discard_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Discard_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_discard_confirm(inputs)
	if (locale === "en-XA") return en_xa2_library_discard_confirm(inputs)
	return en_library_discard_confirm(inputs)
});