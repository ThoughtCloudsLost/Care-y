/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Type_VoicemailInputs */

const en_logs_type_voicemail = /** @type {(inputs: Logs_Type_VoicemailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemail`)
};

const es_logs_type_voicemail = /** @type {(inputs: Logs_Type_VoicemailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensaje de voz`)
};

/**
* | output |
* | --- |
* | "Voicemail" |
*
* @param {Logs_Type_VoicemailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_type_voicemail = /** @type {((inputs?: Logs_Type_VoicemailInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Type_VoicemailInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_type_voicemail(inputs)
	return es_logs_type_voicemail(inputs)
});