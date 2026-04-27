/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Upload_AudioInputs */

const en_admin_greetings_upload_audio = /** @type {(inputs: Admin_Greetings_Upload_AudioInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Upload audio file`)
};

const es_admin_greetings_upload_audio = /** @type {(inputs: Admin_Greetings_Upload_AudioInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Subir archivo de audio`)
};

/**
* | output |
* | --- |
* | "Upload audio file" |
*
* @param {Admin_Greetings_Upload_AudioInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_upload_audio = /** @type {((inputs?: Admin_Greetings_Upload_AudioInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Upload_AudioInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_upload_audio(inputs)
	return es_admin_greetings_upload_audio(inputs)
});