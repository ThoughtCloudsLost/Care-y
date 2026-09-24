/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Audit_Empty_TitleInputs */

const en_logs_audit_empty_title = /** @type {(inputs: Logs_Audit_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No audit events found`)
};

const es_logs_audit_empty_title = /** @type {(inputs: Logs_Audit_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se encontraron eventos de auditoría`)
};

const en_xa2_logs_audit_empty_title = /** @type {(inputs: Logs_Audit_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò àùdìt èvènts fòùnd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "No audit events found" |
*
* @param {Logs_Audit_Empty_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_audit_empty_title = /** @type {((inputs?: Logs_Audit_Empty_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Audit_Empty_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_audit_empty_title(inputs)
	if (locale === "en-XA") return en_xa2_logs_audit_empty_title(inputs)
	return en_logs_audit_empty_title(inputs)
});