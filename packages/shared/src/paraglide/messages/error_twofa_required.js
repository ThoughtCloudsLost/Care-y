/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Twofa_RequiredInputs */

const en_error_twofa_required = /** @type {(inputs: Error_Twofa_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two-factor verification required.`)
};

const es_error_twofa_required = /** @type {(inputs: Error_Twofa_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se requiere verificación de dos factores.`)
};

const en_xa2_error_twofa_required = /** @type {(inputs: Error_Twofa_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Twò-fàctòr vèrìfìcàtìòn rèqùìrèd. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Two-factor verification required." |
*
* @param {Error_Twofa_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_twofa_required = /** @type {((inputs?: Error_Twofa_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Twofa_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_twofa_required(inputs)
	if (locale === "en-XA") return en_xa2_error_twofa_required(inputs)
	return en_error_twofa_required(inputs)
});