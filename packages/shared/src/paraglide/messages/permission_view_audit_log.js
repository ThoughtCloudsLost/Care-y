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

const en_xa2_permission_view_audit_log = /** @type {(inputs: Permission_View_Audit_LogInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw àùdìt lòg •••••⟧`)
};

/**
* | output |
* | --- |
* | "View audit log" |
*
* @param {Permission_View_Audit_LogInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_view_audit_log = /** @type {((inputs?: Permission_View_Audit_LogInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Audit_LogInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_audit_log(inputs)
	if (locale === "en-XA") return en_xa2_permission_view_audit_log(inputs)
	return en_permission_view_audit_log(inputs)
});