/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Pii_Retention_PurgeInputs */

const en_audit_event_pii_retention_purge = /** @type {(inputs: Audit_Event_Pii_Retention_PurgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personal data removed by retention policy`)
};

const es_audit_event_pii_retention_purge = /** @type {(inputs: Audit_Event_Pii_Retention_PurgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Datos personales eliminados por la política de retención`)
};

const en_xa2_audit_event_pii_retention_purge = /** @type {(inputs: Audit_Event_Pii_Retention_PurgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pèrsònàl dàtà rèmòvèd by rètèntìòn pòlìcy •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Personal data removed by retention policy" |
*
* @param {Audit_Event_Pii_Retention_PurgeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_pii_retention_purge = /** @type {((inputs?: Audit_Event_Pii_Retention_PurgeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Pii_Retention_PurgeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_pii_retention_purge(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_pii_retention_purge(inputs)
	return en_audit_event_pii_retention_purge(inputs)
});