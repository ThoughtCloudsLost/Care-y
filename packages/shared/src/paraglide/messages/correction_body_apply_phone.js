/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Correction_Body_Apply_PhoneInputs */

const en_correction_body_apply_phone = /** @type {(inputs: Correction_Body_Apply_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Apply phone number`)
};

const es_correction_body_apply_phone = /** @type {(inputs: Correction_Body_Apply_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aplicar número de teléfono`)
};

const en_xa2_correction_body_apply_phone = /** @type {(inputs: Correction_Body_Apply_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àpply phònè nùmbèr ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Apply phone number" |
*
* @param {Correction_Body_Apply_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const correction_body_apply_phone = /** @type {((inputs?: Correction_Body_Apply_PhoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Correction_Body_Apply_PhoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_correction_body_apply_phone(inputs)
	if (locale === "en-XA") return en_xa2_correction_body_apply_phone(inputs)
	return en_correction_body_apply_phone(inputs)
});