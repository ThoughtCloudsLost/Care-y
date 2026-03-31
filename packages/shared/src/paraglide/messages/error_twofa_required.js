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

/**
* | output |
* | --- |
* | "Two-factor verification required." |
*
* @param {Error_Twofa_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_twofa_required = /** @type {((inputs?: Error_Twofa_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Twofa_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_twofa_required(inputs)
	return es_error_twofa_required(inputs)
});