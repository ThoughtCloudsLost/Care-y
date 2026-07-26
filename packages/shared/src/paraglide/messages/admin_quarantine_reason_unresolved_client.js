/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Reason_Unresolved_ClientInputs */

const en_admin_quarantine_reason_unresolved_client = /** @type {(inputs: Admin_Quarantine_Reason_Unresolved_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unresolved caller`)
};

const es_admin_quarantine_reason_unresolved_client = /** @type {(inputs: Admin_Quarantine_Reason_Unresolved_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamante no identificado`)
};

/**
* | output |
* | --- |
* | "Unresolved caller" |
*
* @param {Admin_Quarantine_Reason_Unresolved_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_reason_unresolved_client = /** @type {((inputs?: Admin_Quarantine_Reason_Unresolved_ClientInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Reason_Unresolved_ClientInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_reason_unresolved_client(inputs)
	return es_admin_quarantine_reason_unresolved_client(inputs)
});