/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Correction_Body_Apply_EmailInputs */

const en_correction_body_apply_email = /** @type {(inputs: Correction_Body_Apply_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Apply email address`)
};

const es_correction_body_apply_email = /** @type {(inputs: Correction_Body_Apply_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aplicar dirección de correo`)
};

const en_xa2_correction_body_apply_email = /** @type {(inputs: Correction_Body_Apply_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àpply èmàìl àddrèss ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Apply email address" |
*
* @param {Correction_Body_Apply_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const correction_body_apply_email = /** @type {((inputs?: Correction_Body_Apply_EmailInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Correction_Body_Apply_EmailInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_correction_body_apply_email(inputs)
	if (locale === "en-XA") return en_xa2_correction_body_apply_email(inputs)
	return en_correction_body_apply_email(inputs)
});