/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Encryption_UnavailableInputs */

const en_intake_error_encryption_unavailable = /** @type {(inputs: Intake_Error_Encryption_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form can't encrypt right now. Please call instead.`)
};

const es_intake_error_encryption_unavailable = /** @type {(inputs: Intake_Error_Encryption_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario no puede cifrar en este momento. Por favor llama en su lugar.`)
};

/**
* | output |
* | --- |
* | "This form can't encrypt right now. Please call instead." |
*
* @param {Intake_Error_Encryption_UnavailableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_encryption_unavailable = /** @type {((inputs?: Intake_Error_Encryption_UnavailableInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Encryption_UnavailableInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_encryption_unavailable(inputs)
	return es_intake_error_encryption_unavailable(inputs)
});