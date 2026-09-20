/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Audit_LogInputs */

const en_permission_view_audit_log = /** @type {(inputs: Permission_View_Audit_LogInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View audit log`)
};

const es_permission_view_audit_log = /** @type {(inputs: Permission_View_Audit_LogInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver registro de auditoría`)
};

/**
* | output |
* | --- |
* | "View audit log" |
*
* @param {Permission_View_Audit_LogInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_audit_log = /** @type {((inputs?: Permission_View_Audit_LogInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Audit_LogInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_audit_log(inputs)
	return en_permission_view_audit_log(inputs)
});