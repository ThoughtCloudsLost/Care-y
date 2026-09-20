/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Reason_No_Intake_QueueInputs */

const en_admin_quarantine_reason_no_intake_queue = /** @type {(inputs: Admin_Quarantine_Reason_No_Intake_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No intake queue configured`)
};

const es_admin_quarantine_reason_no_intake_queue = /** @type {(inputs: Admin_Quarantine_Reason_No_Intake_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin cola de admisión configurada`)
};

const en_xa2_admin_quarantine_reason_no_intake_queue = /** @type {(inputs: Admin_Quarantine_Reason_No_Intake_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò ìntàkè qùèùè cònfìgùrèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No intake queue configured" |
*
* @param {Admin_Quarantine_Reason_No_Intake_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_reason_no_intake_queue = /** @type {((inputs?: Admin_Quarantine_Reason_No_Intake_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Reason_No_Intake_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_reason_no_intake_queue(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_reason_no_intake_queue(inputs)
	return en_admin_quarantine_reason_no_intake_queue(inputs)
});