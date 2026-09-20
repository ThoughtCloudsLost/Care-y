/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_Resolution_TitleInputs */

const en_admin_reports_resolution_title = /** @type {(inputs: Admin_Reports_Resolution_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resolution time`)
};

const es_admin_reports_resolution_title = /** @type {(inputs: Admin_Reports_Resolution_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tiempo de resolución`)
};

const en_xa2_admin_reports_resolution_title = /** @type {(inputs: Admin_Reports_Resolution_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsòlùtìòn tìmè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Resolution time" |
*
* @param {Admin_Reports_Resolution_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_resolution_title = /** @type {((inputs?: Admin_Reports_Resolution_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Resolution_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_resolution_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_resolution_title(inputs)
	return en_admin_reports_resolution_title(inputs)
});