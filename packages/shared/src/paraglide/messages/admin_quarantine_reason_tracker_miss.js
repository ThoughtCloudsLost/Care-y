/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Reason_Tracker_MissInputs */

const en_admin_quarantine_reason_tracker_miss = /** @type {(inputs: Admin_Quarantine_Reason_Tracker_MissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No matching call tracker`)
};

const es_admin_quarantine_reason_tracker_miss = /** @type {(inputs: Admin_Quarantine_Reason_Tracker_MissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin rastreador de llamadas coincidente`)
};

/**
* | output |
* | --- |
* | "No matching call tracker" |
*
* @param {Admin_Quarantine_Reason_Tracker_MissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_reason_tracker_miss = /** @type {((inputs?: Admin_Quarantine_Reason_Tracker_MissInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Reason_Tracker_MissInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_reason_tracker_miss(inputs)
	return es_admin_quarantine_reason_tracker_miss(inputs)
});