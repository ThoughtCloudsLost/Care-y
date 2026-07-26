/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Dismiss_ErrorInputs */

const en_admin_quarantine_dismiss_error = /** @type {(inputs: Admin_Quarantine_Dismiss_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to dismiss voicemail`)
};

const es_admin_quarantine_dismiss_error = /** @type {(inputs: Admin_Quarantine_Dismiss_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo descartar el correo de voz`)
};

/**
* | output |
* | --- |
* | "Failed to dismiss voicemail" |
*
* @param {Admin_Quarantine_Dismiss_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_dismiss_error = /** @type {((inputs?: Admin_Quarantine_Dismiss_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Dismiss_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_dismiss_error(inputs)
	return es_admin_quarantine_dismiss_error(inputs)
});