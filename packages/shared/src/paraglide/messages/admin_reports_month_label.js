/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_Month_LabelInputs */

const en_admin_reports_month_label = /** @type {(inputs: Admin_Reports_Month_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Month`)
};

const es_admin_reports_month_label = /** @type {(inputs: Admin_Reports_Month_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mes`)
};

const en_xa2_admin_reports_month_label = /** @type {(inputs: Admin_Reports_Month_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mònth ••⟧`)
};

/**
* | output |
* | --- |
* | "Month" |
*
* @param {Admin_Reports_Month_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_month_label = /** @type {((inputs?: Admin_Reports_Month_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Month_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_month_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_month_label(inputs)
	return en_admin_reports_month_label(inputs)
});