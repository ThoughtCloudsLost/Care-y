/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Audit_Permission_RequiredInputs */

const en_logs_audit_permission_required = /** @type {(inputs: Logs_Audit_Permission_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The audit log requires the View audit log permission.`)
};

const es_logs_audit_permission_required = /** @type {(inputs: Logs_Audit_Permission_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El registro de auditoría requiere el permiso Ver registro de auditoría.`)
};

const en_xa2_logs_audit_permission_required = /** @type {(inputs: Logs_Audit_Permission_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè àùdìt lòg rèqùìrès thè Vìèw àùdìt lòg pèrmìssìòn. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The audit log requires the View audit log permission." |
*
* @param {Logs_Audit_Permission_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_audit_permission_required = /** @type {((inputs?: Logs_Audit_Permission_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Audit_Permission_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_audit_permission_required(inputs)
	if (locale === "en-XA") return en_xa2_logs_audit_permission_required(inputs)
	return en_logs_audit_permission_required(inputs)
});