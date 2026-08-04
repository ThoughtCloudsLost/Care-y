/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_ReportsInputs */

const en_permission_view_reports = /** @type {(inputs: Permission_View_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View reports`)
};

const es_permission_view_reports = /** @type {(inputs: Permission_View_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver reportes`)
};

/**
* | output |
* | --- |
* | "View reports" |
*
* @param {Permission_View_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_reports = /** @type {((inputs?: Permission_View_ReportsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_ReportsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_view_reports(inputs)
	return es_permission_view_reports(inputs)
});