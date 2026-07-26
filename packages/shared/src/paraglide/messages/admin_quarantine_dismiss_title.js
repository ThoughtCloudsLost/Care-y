/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Dismiss_TitleInputs */

const en_admin_quarantine_dismiss_title = /** @type {(inputs: Admin_Quarantine_Dismiss_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss voicemail`)
};

const es_admin_quarantine_dismiss_title = /** @type {(inputs: Admin_Quarantine_Dismiss_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descartar correo de voz`)
};

/**
* | output |
* | --- |
* | "Dismiss voicemail" |
*
* @param {Admin_Quarantine_Dismiss_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_dismiss_title = /** @type {((inputs?: Admin_Quarantine_Dismiss_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Dismiss_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_dismiss_title(inputs)
	return es_admin_quarantine_dismiss_title(inputs)
});