/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Status_DismissedInputs */

const en_admin_quarantine_status_dismissed = /** @type {(inputs: Admin_Quarantine_Status_DismissedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismissed`)
};

const es_admin_quarantine_status_dismissed = /** @type {(inputs: Admin_Quarantine_Status_DismissedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descartado`)
};

/**
* | output |
* | --- |
* | "Dismissed" |
*
* @param {Admin_Quarantine_Status_DismissedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_status_dismissed = /** @type {((inputs?: Admin_Quarantine_Status_DismissedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Status_DismissedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_status_dismissed(inputs)
	return es_admin_quarantine_status_dismissed(inputs)
});