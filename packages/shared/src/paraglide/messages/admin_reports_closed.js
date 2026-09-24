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

const en_xa2_admin_reports_closed = /** @type {(inputs: Admin_Reports_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦clòsèd ••⟧`)
};

/**
* | output |
* | --- |
* | "closed" |
*
* @param {Admin_Reports_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_closed = /** @type {((inputs?: Admin_Reports_ClosedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_ClosedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_closed(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_closed(inputs)
	return en_admin_reports_closed(inputs)
});