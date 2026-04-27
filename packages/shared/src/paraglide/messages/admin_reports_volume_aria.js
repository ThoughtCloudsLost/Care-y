/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_Volume_AriaInputs */

const en_admin_reports_volume_aria = /** @type {(inputs: Admin_Reports_Volume_AriaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Monthly ticket volume over the last 12 months`)
};

const es_admin_reports_volume_aria = /** @type {(inputs: Admin_Reports_Volume_AriaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volumen mensual de tickets en los ultimos 12 meses`)
};

/**
* | output |
* | --- |
* | "Monthly ticket volume over the last 12 months" |
*
* @param {Admin_Reports_Volume_AriaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_volume_aria = /** @type {((inputs?: Admin_Reports_Volume_AriaInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Volume_AriaInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_volume_aria(inputs)
	return es_admin_reports_volume_aria(inputs)
});