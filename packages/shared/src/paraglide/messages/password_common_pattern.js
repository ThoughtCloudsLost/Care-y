/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Password_Common_PatternInputs */

const en_password_common_pattern = /** @type {(inputs: Password_Common_PatternInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This follows a predictable pattern. Try something more varied.`)
};

const es_password_common_pattern = /** @type {(inputs: Password_Common_PatternInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sigue un patrón predecible. Intenta algo más variado.`)
};

/**
* | output |
* | --- |
* | "This follows a predictable pattern. Try something more varied." |
*
* @param {Password_Common_PatternInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_common_pattern = /** @type {((inputs?: Password_Common_PatternInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_Common_PatternInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_password_common_pattern(inputs)
	return es_password_common_pattern(inputs)
});