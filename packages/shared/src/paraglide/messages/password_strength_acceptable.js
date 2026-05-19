/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Password_Strength_AcceptableInputs */

const en_password_strength_acceptable = /** @type {(inputs: Password_Strength_AcceptableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acceptable`)
};

const es_password_strength_acceptable = /** @type {(inputs: Password_Strength_AcceptableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aceptable`)
};

/**
* | output |
* | --- |
* | "Acceptable" |
*
* @param {Password_Strength_AcceptableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_strength_acceptable = /** @type {((inputs?: Password_Strength_AcceptableInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_Strength_AcceptableInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_password_strength_acceptable(inputs)
	return es_password_strength_acceptable(inputs)
});