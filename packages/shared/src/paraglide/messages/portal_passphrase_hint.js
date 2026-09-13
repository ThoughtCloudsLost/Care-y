/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_HintInputs */

const en_portal_passphrase_hint = /** @type {(inputs: Portal_Passphrase_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the passphrase you were given on the phone.`)
};

const es_portal_passphrase_hint = /** @type {(inputs: Portal_Passphrase_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa la frase que te dieron por teléfono.`)
};

/**
* | output |
* | --- |
* | "Enter the passphrase you were given on the phone." |
*
* @param {Portal_Passphrase_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_hint = /** @type {((inputs?: Portal_Passphrase_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_hint(inputs)
	return es_portal_passphrase_hint(inputs)
});