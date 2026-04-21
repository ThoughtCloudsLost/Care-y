/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ days: NonNullable<unknown> }} Admin_Reports_Days_UnitInputs */

const en_admin_reports_days_unit = /** @type {(inputs: Admin_Reports_Days_UnitInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.days}d`)
};

const es_admin_reports_days_unit = /** @type {(inputs: Admin_Reports_Days_UnitInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.days}d`)
};

/**
* | output |
* | --- |
* | "{days}d" |
*
* @param {Admin_Reports_Days_UnitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_days_unit = /** @type {((inputs: Admin_Reports_Days_UnitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Days_UnitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_days_unit(inputs)
	return es_admin_reports_days_unit(inputs)
});