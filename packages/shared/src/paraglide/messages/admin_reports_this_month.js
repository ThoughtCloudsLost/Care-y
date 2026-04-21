/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_This_MonthInputs */

const en_admin_reports_this_month = /** @type {(inputs: Admin_Reports_This_MonthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This month`)
};

const es_admin_reports_this_month = /** @type {(inputs: Admin_Reports_This_MonthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este mes`)
};

/**
* | output |
* | --- |
* | "This month" |
*
* @param {Admin_Reports_This_MonthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_this_month = /** @type {((inputs?: Admin_Reports_This_MonthInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_This_MonthInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_this_month(inputs)
	return es_admin_reports_this_month(inputs)
});