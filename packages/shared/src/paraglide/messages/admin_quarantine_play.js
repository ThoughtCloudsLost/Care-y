/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_PlayInputs */

const en_admin_quarantine_play = /** @type {(inputs: Admin_Quarantine_PlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Play voicemail`)
};

const es_admin_quarantine_play = /** @type {(inputs: Admin_Quarantine_PlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reproducir correo de voz`)
};

/**
* | output |
* | --- |
* | "Play voicemail" |
*
* @param {Admin_Quarantine_PlayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_play = /** @type {((inputs?: Admin_Quarantine_PlayInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_PlayInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_play(inputs)
	return es_admin_quarantine_play(inputs)
});