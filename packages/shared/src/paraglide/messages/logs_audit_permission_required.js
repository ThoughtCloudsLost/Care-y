/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Audit_Permission_RequiredInputs */

const en_logs_audit_permission_required = /** @type {(inputs: Logs_Audit_Permission_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The audit log requires the View Audit Log permission.`)
};

const es_logs_audit_permission_required = /** @type {(inputs: Logs_Audit_Permission_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El registro de auditoría requiere el permiso Ver registro de auditoría.`)
};

/**
* | output |
* | --- |
* | "The audit log requires the View Audit Log permission." |
*
* @param {Logs_Audit_Permission_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_audit_permission_required = /** @type {((inputs?: Logs_Audit_Permission_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Audit_Permission_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_audit_permission_required(inputs)
	return en_logs_audit_permission_required(inputs)
});