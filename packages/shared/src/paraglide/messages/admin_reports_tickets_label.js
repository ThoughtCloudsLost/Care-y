/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown> }} Admin_Reports_Tickets_LabelInputs */

const en_admin_reports_tickets_label = /** @type {(inputs: Admin_Reports_Tickets_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}`)
};

const es_admin_reports_tickets_label = /** @type {(inputs: Admin_Reports_Tickets_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}`)
};

/**
* | output |
* | --- |
* | "{Tickets}" |
*
* @param {Admin_Reports_Tickets_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_tickets_label = /** @type {((inputs: Admin_Reports_Tickets_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Tickets_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_tickets_label(inputs)
	return es_admin_reports_tickets_label(inputs)
});