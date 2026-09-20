/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, tickets: NonNullable<unknown> }} Admin_Reports_View_OpenInputs */

const en_admin_reports_view_open = /** @type {(inputs: Admin_Reports_View_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} open ${i?.tickets}, view filtered list`)
};

const es_admin_reports_view_open = /** @type {(inputs: Admin_Reports_View_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.tickets} abiertos, ver lista filtrada`)
};

const en_xa2_admin_reports_view_open = /** @type {(inputs: Admin_Reports_View_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} òpèn  ••${i?.tickets}, vìèw fìltèrèd lìst ••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} open {tickets}, view filtered list" |
*
* @param {Admin_Reports_View_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_view_open = /** @type {((inputs: Admin_Reports_View_OpenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_View_OpenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_view_open(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_view_open(inputs)
	return en_admin_reports_view_open(inputs)
});