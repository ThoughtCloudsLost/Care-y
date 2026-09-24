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

const en_xa2_correction_body_new_email = /** @type {(inputs: Correction_Body_New_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw èmàìl •••⟧`)
};

/**
* | output |
* | --- |
* | "New email" |
*
* @param {Correction_Body_New_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const correction_body_new_email = /** @type {((inputs?: Correction_Body_New_EmailInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Correction_Body_New_EmailInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_correction_body_new_email(inputs)
	if (locale === "en-XA") return en_xa2_correction_body_new_email(inputs)
	return en_correction_body_new_email(inputs)
});