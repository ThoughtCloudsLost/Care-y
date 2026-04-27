/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Role_ReportsInputs */

const en_mgr_role_reports = /** @type {(inputs: Mgr_Role_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View reports and team metrics`)
};

const es_mgr_role_reports = /** @type {(inputs: Mgr_Role_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver reportes y metricas del equipo`)
};

/**
* | output |
* | --- |
* | "View reports and team metrics" |
*
* @param {Mgr_Role_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_role_reports = /** @type {((inputs?: Mgr_Role_ReportsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Role_ReportsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_role_reports(inputs)
	return es_mgr_role_reports(inputs)
});