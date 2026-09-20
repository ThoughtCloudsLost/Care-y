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

const en_xa2_portal_passphrase_wrong = /** @type {(inputs: Portal_Passphrase_WrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thàt pàssphràsè dìd nòt wòrk. Chèck thè wòrds ànd try àgàìn. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "That passphrase did not work. Check the words and try again." |
*
* @param {Portal_Passphrase_WrongInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_wrong = /** @type {((inputs?: Portal_Passphrase_WrongInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_WrongInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_wrong(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_wrong(inputs)
	return en_portal_passphrase_wrong(inputs)
});