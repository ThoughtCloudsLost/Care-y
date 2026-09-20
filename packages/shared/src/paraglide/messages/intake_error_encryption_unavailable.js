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

const en_xa2_intake_error_encryption_unavailable = /** @type {(inputs: Intake_Error_Encryption_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs fòrm càn't èncrypt rìght nòw. Plèàsè càll ìnstèàd. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This form can't encrypt right now. Please call instead." |
*
* @param {Intake_Error_Encryption_UnavailableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_encryption_unavailable = /** @type {((inputs?: Intake_Error_Encryption_UnavailableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Encryption_UnavailableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_error_encryption_unavailable(inputs)
	if (locale === "en-XA") return en_xa2_intake_error_encryption_unavailable(inputs)
	return en_intake_error_encryption_unavailable(inputs)
});