/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Audio_UploadingInputs */

const en_admin_greetings_audio_uploading = /** @type {(inputs: Admin_Greetings_Audio_UploadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Uploading...`)
};

const es_admin_greetings_audio_uploading = /** @type {(inputs: Admin_Greetings_Audio_UploadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Subiendo...`)
};

/**
* | output |
* | --- |
* | "Uploading..." |
*
* @param {Admin_Greetings_Audio_UploadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_uploading = /** @type {((inputs?: Admin_Greetings_Audio_UploadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Audio_UploadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_audio_uploading(inputs)
	return es_admin_greetings_audio_uploading(inputs)
});