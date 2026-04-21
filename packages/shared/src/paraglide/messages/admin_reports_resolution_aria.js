/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_Resolution_AriaInputs */

const en_admin_reports_resolution_aria = /** @type {(inputs: Admin_Reports_Resolution_AriaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Average resolution time in days over the last 12 months`)
};

const es_admin_reports_resolution_aria = /** @type {(inputs: Admin_Reports_Resolution_AriaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tiempo promedio de resolucion en dias en los ultimos 12 meses`)
};

/**
* | output |
* | --- |
* | "Average resolution time in days over the last 12 months" |
*
* @param {Admin_Reports_Resolution_AriaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_resolution_aria = /** @type {((inputs?: Admin_Reports_Resolution_AriaInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Resolution_AriaInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_resolution_aria(inputs)
	return es_admin_reports_resolution_aria(inputs)
});