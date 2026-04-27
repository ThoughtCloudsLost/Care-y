/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Reports_View_OpenInputs */

const en_admin_reports_view_open = /** @type {(inputs: Admin_Reports_View_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} open tickets, view filtered list`)
};

const es_admin_reports_view_open = /** @type {(inputs: Admin_Reports_View_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} tickets abiertos, ver lista filtrada`)
};

/**
* | output |
* | --- |
* | "{count} open tickets, view filtered list" |
*
* @param {Admin_Reports_View_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_view_open = /** @type {((inputs: Admin_Reports_View_OpenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_View_OpenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_view_open(inputs)
	return es_admin_reports_view_open(inputs)
});