/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Link_ReportsInputs */

const en_mgr_link_reports = /** @type {(inputs: Mgr_Link_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View Reports`)
};

const es_mgr_link_reports = /** @type {(inputs: Mgr_Link_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver Reportes`)
};

/**
* | output |
* | --- |
* | "View Reports" |
*
* @param {Mgr_Link_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_link_reports = /** @type {((inputs?: Mgr_Link_ReportsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Link_ReportsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_link_reports(inputs)
	return es_mgr_link_reports(inputs)
});