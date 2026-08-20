/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Portal_Channel_RegeneratedInputs */

const en_audit_event_portal_channel_regenerated = /** @type {(inputs: Audit_Event_Portal_Channel_RegeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure link regenerated`)
};

const es_audit_event_portal_channel_regenerated = /** @type {(inputs: Audit_Event_Portal_Channel_RegeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace seguro regenerado`)
};

/**
* | output |
* | --- |
* | "Secure link regenerated" |
*
* @param {Audit_Event_Portal_Channel_RegeneratedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_portal_channel_regenerated = /** @type {((inputs?: Audit_Event_Portal_Channel_RegeneratedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Portal_Channel_RegeneratedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_portal_channel_regenerated(inputs)
	return es_audit_event_portal_channel_regenerated(inputs)
});