/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Correction_Body_New_EmailInputs */

const en_correction_body_new_email = /** @type {(inputs: Correction_Body_New_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New email`)
};

const es_correction_body_new_email = /** @type {(inputs: Correction_Body_New_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo correo electrónico`)
};

/**
* | output |
* | --- |
* | "New email" |
*
* @param {Correction_Body_New_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const correction_body_new_email = /** @type {((inputs?: Correction_Body_New_EmailInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Correction_Body_New_EmailInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_correction_body_new_email(inputs)
	return en_correction_body_new_email(inputs)
});