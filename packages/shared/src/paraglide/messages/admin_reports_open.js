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

const en_xa2_admin_reports_open = /** @type {(inputs: Admin_Reports_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦òpèn ••⟧`)
};

/**
* | output |
* | --- |
* | "open" |
*
* @param {Admin_Reports_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_open = /** @type {((inputs?: Admin_Reports_OpenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_OpenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_open(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_open(inputs)
	return en_admin_reports_open(inputs)
});