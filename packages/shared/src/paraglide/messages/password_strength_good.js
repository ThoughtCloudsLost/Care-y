/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Password_Strength_GoodInputs */

const en_password_strength_good = /** @type {(inputs: Password_Strength_GoodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Good`)
};

const es_password_strength_good = /** @type {(inputs: Password_Strength_GoodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buena`)
};

/**
* | output |
* | --- |
* | "Good" |
*
* @param {Password_Strength_GoodInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_strength_good = /** @type {((inputs?: Password_Strength_GoodInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_Strength_GoodInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_password_strength_good(inputs)
	return es_password_strength_good(inputs)
});