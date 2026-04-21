/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_By_QueueInputs */

const en_admin_reports_by_queue = /** @type {(inputs: Admin_Reports_By_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`By queue`)
};

const es_admin_reports_by_queue = /** @type {(inputs: Admin_Reports_By_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por cola`)
};

/**
* | output |
* | --- |
* | "By queue" |
*
* @param {Admin_Reports_By_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_by_queue = /** @type {((inputs?: Admin_Reports_By_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_By_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_by_queue(inputs)
	return es_admin_reports_by_queue(inputs)
});