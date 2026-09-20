/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Decrypt_FailedInputs */

const en_intake_responses_decrypt_failed = /** @type {(inputs: Intake_Responses_Decrypt_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not decrypt`)
};

const es_intake_responses_decrypt_failed = /** @type {(inputs: Intake_Responses_Decrypt_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo descifrar`)
};

const en_xa2_intake_responses_decrypt_failed = /** @type {(inputs: Intake_Responses_Decrypt_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt dècrypt ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not decrypt" |
*
* @param {Intake_Responses_Decrypt_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_decrypt_failed = /** @type {((inputs?: Intake_Responses_Decrypt_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Decrypt_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_decrypt_failed(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_decrypt_failed(inputs)
	return en_intake_responses_decrypt_failed(inputs)
});