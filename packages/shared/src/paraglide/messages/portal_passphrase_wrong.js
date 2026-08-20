/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_WrongInputs */

const en_portal_passphrase_wrong = /** @type {(inputs: Portal_Passphrase_WrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That passphrase did not work. Check the words and try again.`)
};

const es_portal_passphrase_wrong = /** @type {(inputs: Portal_Passphrase_WrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esa frase no funcionó. Verifica las palabras e inténtalo de nuevo.`)
};

/**
* | output |
* | --- |
* | "That passphrase did not work. Check the words and try again." |
*
* @param {Portal_Passphrase_WrongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_wrong = /** @type {((inputs?: Portal_Passphrase_WrongInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_WrongInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_wrong(inputs)
	return es_portal_passphrase_wrong(inputs)
});