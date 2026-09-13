/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Tab_AuditInputs */

const en_logs_tab_audit = /** @type {(inputs: Logs_Tab_AuditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Audit`)
};

const es_logs_tab_audit = /** @type {(inputs: Logs_Tab_AuditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auditoria`)
};

/**
* | output |
* | --- |
* | "Audit" |
*
* @param {Logs_Tab_AuditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_tab_audit = /** @type {((inputs?: Logs_Tab_AuditInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Tab_AuditInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_tab_audit(inputs)
	return es_logs_tab_audit(inputs)
});