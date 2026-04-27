/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_ClosedInputs */

const en_admin_reports_closed = /** @type {(inputs: Admin_Reports_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`closed`)
};

const es_admin_reports_closed = /** @type {(inputs: Admin_Reports_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`cerrados`)
};

/**
* | output |
* | --- |
* | "closed" |
*
* @param {Admin_Reports_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_closed = /** @type {((inputs?: Admin_Reports_ClosedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_ClosedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_closed(inputs)
	return es_admin_reports_closed(inputs)
});