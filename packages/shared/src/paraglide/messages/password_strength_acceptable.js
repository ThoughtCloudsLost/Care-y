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

const en_xa2_password_strength_acceptable = /** @type {(inputs: Password_Strength_AcceptableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccèptàblè •••⟧`)
};

/**
* | output |
* | --- |
* | "Acceptable" |
*
* @param {Password_Strength_AcceptableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const password_strength_acceptable = /** @type {((inputs?: Password_Strength_AcceptableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_Strength_AcceptableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_password_strength_acceptable(inputs)
	if (locale === "en-XA") return en_xa2_password_strength_acceptable(inputs)
	return en_password_strength_acceptable(inputs)
});