/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_ReportsInputs */

const en_admin_tab_reports = /** @type {(inputs: Admin_Tab_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reports`)
};

const es_admin_tab_reports = /** @type {(inputs: Admin_Tab_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Informes`)
};

/**
* | output |
* | --- |
* | "Reports" |
*
* @param {Admin_Tab_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_reports = /** @type {((inputs?: Admin_Tab_ReportsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_ReportsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_reports(inputs)
	return es_admin_tab_reports(inputs)
});