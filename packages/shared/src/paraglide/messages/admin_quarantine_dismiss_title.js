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

const en_xa2_admin_quarantine_dismiss_title = /** @type {(inputs: Admin_Quarantine_Dismiss_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsmìss vòìcèmàìl ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Dismiss voicemail" |
*
* @param {Admin_Quarantine_Dismiss_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_dismiss_title = /** @type {((inputs?: Admin_Quarantine_Dismiss_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Dismiss_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_dismiss_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_dismiss_title(inputs)
	return en_admin_quarantine_dismiss_title(inputs)
});