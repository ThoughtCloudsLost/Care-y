/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Protected_IdentifierInputs */

const en_vol_protected_identifier = /** @type {(inputs: Vol_Protected_IdentifierInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your login identifier is a pseudonym, not linked to your real identity.`)
};

const es_vol_protected_identifier = /** @type {(inputs: Vol_Protected_IdentifierInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu identificador de inicio de sesion es un seudonimo, no vinculado a tu identidad real.`)
};

/**
* | output |
* | --- |
* | "Your login identifier is a pseudonym, not linked to your real identity." |
*
* @param {Vol_Protected_IdentifierInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_protected_identifier = /** @type {((inputs?: Vol_Protected_IdentifierInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Protected_IdentifierInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_protected_identifier(inputs)
	return es_vol_protected_identifier(inputs)
});