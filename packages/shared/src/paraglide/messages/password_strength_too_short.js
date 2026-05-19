/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ min: NonNullable<unknown> }} Password_Strength_Too_ShortInputs */

const en_password_strength_too_short = /** @type {(inputs: Password_Strength_Too_ShortInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Too short (minimum ${i?.min} characters)`)
};

const es_password_strength_too_short = /** @type {(inputs: Password_Strength_Too_ShortInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Muy corta (mínimo ${i?.min} caracteres)`)
};

/**
* | output |
* | --- |
* | "Too short (minimum {min} characters)" |
*
* @param {Password_Strength_Too_ShortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_strength_too_short = /** @type {((inputs: Password_Strength_Too_ShortInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_Strength_Too_ShortInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_password_strength_too_short(inputs)
	return es_password_strength_too_short(inputs)
});