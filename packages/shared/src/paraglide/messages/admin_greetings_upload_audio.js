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

const en_xa2_admin_greetings_upload_audio = /** @type {(inputs: Admin_Greetings_Upload_AudioInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùplòàd àùdìò fìlè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Upload audio file" |
*
* @param {Admin_Greetings_Upload_AudioInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_upload_audio = /** @type {((inputs?: Admin_Greetings_Upload_AudioInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Upload_AudioInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_upload_audio(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_upload_audio(inputs)
	return en_admin_greetings_upload_audio(inputs)
});