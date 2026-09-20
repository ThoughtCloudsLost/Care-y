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

const en_xa2_admin_quarantine_status_dismissed = /** @type {(inputs: Admin_Quarantine_Status_DismissedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsmìssèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Dismissed" |
*
* @param {Admin_Quarantine_Status_DismissedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_status_dismissed = /** @type {((inputs?: Admin_Quarantine_Status_DismissedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Status_DismissedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_status_dismissed(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_status_dismissed(inputs)
	return en_admin_quarantine_status_dismissed(inputs)
});