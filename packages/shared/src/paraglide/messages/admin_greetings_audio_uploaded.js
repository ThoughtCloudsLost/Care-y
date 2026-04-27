/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Audio_UploadedInputs */

const en_admin_greetings_audio_uploaded = /** @type {(inputs: Admin_Greetings_Audio_UploadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Audio greeting uploaded.`)
};

const es_admin_greetings_audio_uploaded = /** @type {(inputs: Admin_Greetings_Audio_UploadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludo de audio subido.`)
};

/**
* | output |
* | --- |
* | "Audio greeting uploaded." |
*
* @param {Admin_Greetings_Audio_UploadedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_uploaded = /** @type {((inputs?: Admin_Greetings_Audio_UploadedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Audio_UploadedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_audio_uploaded(inputs)
	return es_admin_greetings_audio_uploaded(inputs)
});