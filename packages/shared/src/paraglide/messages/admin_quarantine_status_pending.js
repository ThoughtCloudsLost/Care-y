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

/**
* | output |
* | --- |
* | "Pending" |
*
* @param {Admin_Quarantine_Status_PendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_status_pending = /** @type {((inputs?: Admin_Quarantine_Status_PendingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Status_PendingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_status_pending(inputs)
	return es_admin_quarantine_status_pending(inputs)
});