/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Audit_LogInputs */

const en_panel_audit_log = /** @type {(inputs: Panel_Audit_LogInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Audit Log`)
};

const es_panel_audit_log = /** @type {(inputs: Panel_Audit_LogInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registro de auditoria`)
};

/**
* | output |
* | --- |
* | "Audit Log" |
*
* @param {Panel_Audit_LogInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_audit_log = /** @type {((inputs?: Panel_Audit_LogInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Audit_LogInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_audit_log(inputs)
	return es_panel_audit_log(inputs)
});