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

const en_xa2_password_strength_good = /** @type {(inputs: Password_Strength_GoodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gòòd ••⟧`)
};

/**
* | output |
* | --- |
* | "Good" |
*
* @param {Password_Strength_GoodInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const password_strength_good = /** @type {((inputs?: Password_Strength_GoodInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_Strength_GoodInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_password_strength_good(inputs)
	if (locale === "en-XA") return en_xa2_password_strength_good(inputs)
	return en_password_strength_good(inputs)
});