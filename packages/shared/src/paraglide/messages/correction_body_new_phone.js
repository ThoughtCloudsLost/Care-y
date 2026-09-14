/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Correction_Body_New_PhoneInputs */

const en_correction_body_new_phone = /** @type {(inputs: Correction_Body_New_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New phone`)
};

const es_correction_body_new_phone = /** @type {(inputs: Correction_Body_New_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo teléfono`)
};

/**
* | output |
* | --- |
* | "New phone" |
*
* @param {Correction_Body_New_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const correction_body_new_phone = /** @type {((inputs?: Correction_Body_New_PhoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Correction_Body_New_PhoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_correction_body_new_phone(inputs)
	return en_correction_body_new_phone(inputs)
});