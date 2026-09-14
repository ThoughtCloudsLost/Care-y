/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Portal_Reseed_Blob_ConvertedInputs */

const en_audit_event_portal_reseed_blob_converted = /** @type {(inputs: Audit_Event_Portal_Reseed_Blob_ConvertedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Media file converted for secure link`)
};

const es_audit_event_portal_reseed_blob_converted = /** @type {(inputs: Audit_Event_Portal_Reseed_Blob_ConvertedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivo multimedia convertido para el enlace seguro`)
};

/**
* | output |
* | --- |
* | "Media file converted for secure link" |
*
* @param {Audit_Event_Portal_Reseed_Blob_ConvertedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_portal_reseed_blob_converted = /** @type {((inputs?: Audit_Event_Portal_Reseed_Blob_ConvertedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Portal_Reseed_Blob_ConvertedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_portal_reseed_blob_converted(inputs)
	return en_audit_event_portal_reseed_blob_converted(inputs)
});