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

const en_xa2_admin_quarantine_reason_tracker_miss = /** @type {(inputs: Admin_Quarantine_Reason_Tracker_MissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò màtchìng càll tràckèr ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No matching call tracker" |
*
* @param {Admin_Quarantine_Reason_Tracker_MissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_reason_tracker_miss = /** @type {((inputs?: Admin_Quarantine_Reason_Tracker_MissInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Reason_Tracker_MissInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_reason_tracker_miss(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_reason_tracker_miss(inputs)
	return en_admin_quarantine_reason_tracker_miss(inputs)
});