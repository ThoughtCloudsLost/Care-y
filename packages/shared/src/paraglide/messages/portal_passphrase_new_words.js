/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_New_WordsInputs */

const en_portal_passphrase_new_words = /** @type {(inputs: Portal_Passphrase_New_WordsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Try different words`)
};

const es_portal_passphrase_new_words = /** @type {(inputs: Portal_Passphrase_New_WordsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Probar otras palabras`)
};

const en_xa2_portal_passphrase_new_words = /** @type {(inputs: Portal_Passphrase_New_WordsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Try dìffèrènt wòrds ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Try different words" |
*
* @param {Portal_Passphrase_New_WordsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_new_words = /** @type {((inputs?: Portal_Passphrase_New_WordsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_New_WordsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_new_words(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_new_words(inputs)
	return en_portal_passphrase_new_words(inputs)
});