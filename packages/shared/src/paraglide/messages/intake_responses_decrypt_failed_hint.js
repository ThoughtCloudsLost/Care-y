/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Decrypt_Failed_HintInputs */

const en_intake_responses_decrypt_failed_hint = /** @type {(inputs: Intake_Responses_Decrypt_Failed_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This response could not be decrypted. The blob may be malformed or from an earlier format.`)
};

const es_intake_responses_decrypt_failed_hint = /** @type {(inputs: Intake_Responses_Decrypt_Failed_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta respuesta no se pudo descifrar. El contenido puede estar malformado o pertenecer a un formato anterior.`)
};

/**
* | output |
* | --- |
* | "This response could not be decrypted. The blob may be malformed or from an earlier format." |
*
* @param {Intake_Responses_Decrypt_Failed_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_decrypt_failed_hint = /** @type {((inputs?: Intake_Responses_Decrypt_Failed_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Decrypt_Failed_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_decrypt_failed_hint(inputs)
	return es_intake_responses_decrypt_failed_hint(inputs)
});