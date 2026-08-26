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

/**
* | output |
* | --- |
* | "Could not decrypt" |
*
* @param {Intake_Responses_Decrypt_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_decrypt_failed = /** @type {((inputs?: Intake_Responses_Decrypt_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Decrypt_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_decrypt_failed(inputs)
	return es_intake_responses_decrypt_failed(inputs)
});