/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_Avg_ResolutionInputs */

const en_admin_reports_avg_resolution = /** @type {(inputs: Admin_Reports_Avg_ResolutionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Avg. resolution`)
};

const es_admin_reports_avg_resolution = /** @type {(inputs: Admin_Reports_Avg_ResolutionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resolución prom.`)
};

const en_xa2_admin_reports_avg_resolution = /** @type {(inputs: Admin_Reports_Avg_ResolutionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àvg. rèsòlùtìòn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Avg. resolution" |
*
* @param {Admin_Reports_Avg_ResolutionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_avg_resolution = /** @type {((inputs?: Admin_Reports_Avg_ResolutionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Avg_ResolutionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_avg_resolution(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_avg_resolution(inputs)
	return en_admin_reports_avg_resolution(inputs)
});