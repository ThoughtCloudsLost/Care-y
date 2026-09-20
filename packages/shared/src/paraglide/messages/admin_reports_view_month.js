/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, tickets: NonNullable<unknown> }} Admin_Reports_View_MonthInputs */

const en_admin_reports_view_month = /** @type {(inputs: Admin_Reports_View_MonthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.tickets} this month, view filtered list`)
};

const es_admin_reports_view_month = /** @type {(inputs: Admin_Reports_View_MonthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.tickets} este mes, ver lista filtrada`)
};

const en_xa2_admin_reports_view_month = /** @type {(inputs: Admin_Reports_View_MonthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}  •${i?.tickets} thìs mònth, vìèw fìltèrèd lìst ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} {tickets} this month, view filtered list" |
*
* @param {Admin_Reports_View_MonthInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_view_month = /** @type {((inputs: Admin_Reports_View_MonthInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_View_MonthInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_view_month(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_view_month(inputs)
	return en_admin_reports_view_month(inputs)
});