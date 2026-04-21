/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Reports_View_MonthInputs */

const en_admin_reports_view_month = /** @type {(inputs: Admin_Reports_View_MonthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} tickets this month, view filtered list`)
};

const es_admin_reports_view_month = /** @type {(inputs: Admin_Reports_View_MonthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} tickets este mes, ver lista filtrada`)
};

/**
* | output |
* | --- |
* | "{count} tickets this month, view filtered list" |
*
* @param {Admin_Reports_View_MonthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_view_month = /** @type {((inputs: Admin_Reports_View_MonthInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_View_MonthInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_view_month(inputs)
	return es_admin_reports_view_month(inputs)
});