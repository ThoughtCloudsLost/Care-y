/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Dismiss_SuccessInputs */

const en_admin_quarantine_dismiss_success = /** @type {(inputs: Admin_Quarantine_Dismiss_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemail dismissed`)
};

const es_admin_quarantine_dismiss_success = /** @type {(inputs: Admin_Quarantine_Dismiss_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo de voz descartado`)
};

const en_xa2_admin_quarantine_dismiss_success = /** @type {(inputs: Admin_Quarantine_Dismiss_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòìcèmàìl dìsmìssèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Voicemail dismissed" |
*
* @param {Admin_Quarantine_Dismiss_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_dismiss_success = /** @type {((inputs?: Admin_Quarantine_Dismiss_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Dismiss_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_dismiss_success(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_dismiss_success(inputs)
	return en_admin_quarantine_dismiss_success(inputs)
});