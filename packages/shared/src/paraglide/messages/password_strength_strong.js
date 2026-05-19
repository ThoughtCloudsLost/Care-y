/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Password_Strength_StrongInputs */

const en_password_strength_strong = /** @type {(inputs: Password_Strength_StrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Strong`)
};

const es_password_strength_strong = /** @type {(inputs: Password_Strength_StrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fuerte`)
};

/**
* | output |
* | --- |
* | "Strong" |
*
* @param {Password_Strength_StrongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_strength_strong = /** @type {((inputs?: Password_Strength_StrongInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_Strength_StrongInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_password_strength_strong(inputs)
	return es_password_strength_strong(inputs)
});