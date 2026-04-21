/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_OpenInputs */

const en_admin_reports_open = /** @type {(inputs: Admin_Reports_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`open`)
};

const es_admin_reports_open = /** @type {(inputs: Admin_Reports_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`abiertos`)
};

/**
* | output |
* | --- |
* | "open" |
*
* @param {Admin_Reports_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_open = /** @type {((inputs?: Admin_Reports_OpenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_OpenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_open(inputs)
	return es_admin_reports_open(inputs)
});