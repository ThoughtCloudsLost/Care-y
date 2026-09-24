/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Status_PendingInputs */

const en_admin_quarantine_status_pending = /** @type {(inputs: Admin_Quarantine_Status_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pending`)
};

const es_admin_quarantine_status_pending = /** @type {(inputs: Admin_Quarantine_Status_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pendiente`)
};

const en_xa2_admin_quarantine_status_pending = /** @type {(inputs: Admin_Quarantine_Status_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pèndìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Pending" |
*
* @param {Admin_Quarantine_Status_PendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_status_pending = /** @type {((inputs?: Admin_Quarantine_Status_PendingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Status_PendingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_status_pending(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_status_pending(inputs)
	return en_admin_quarantine_status_pending(inputs)
});