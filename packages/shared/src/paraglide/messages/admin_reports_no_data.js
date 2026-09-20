/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_No_DataInputs */

const en_admin_reports_no_data = /** @type {(inputs: Admin_Reports_No_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No report data yet`)
};

const es_admin_reports_no_data = /** @type {(inputs: Admin_Reports_No_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aún no hay datos de reportes`)
};

const en_xa2_admin_reports_no_data = /** @type {(inputs: Admin_Reports_No_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò rèpòrt dàtà yèt ••••••⟧`)
};

/**
* | output |
* | --- |
* | "No report data yet" |
*
* @param {Admin_Reports_No_DataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_no_data = /** @type {((inputs?: Admin_Reports_No_DataInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_No_DataInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_no_data(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_no_data(inputs)
	return en_admin_reports_no_data(inputs)
});