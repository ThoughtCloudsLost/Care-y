/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_Days_LabelInputs */

const en_admin_reports_days_label = /** @type {(inputs: Admin_Reports_Days_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Days`)
};

const es_admin_reports_days_label = /** @type {(inputs: Admin_Reports_Days_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Días`)
};

const en_xa2_admin_reports_days_label = /** @type {(inputs: Admin_Reports_Days_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàys ••⟧`)
};

/**
* | output |
* | --- |
* | "Days" |
*
* @param {Admin_Reports_Days_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_days_label = /** @type {((inputs?: Admin_Reports_Days_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Days_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_days_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_days_label(inputs)
	return en_admin_reports_days_label(inputs)
});