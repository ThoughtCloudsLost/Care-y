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

const en_xa2_audit_event_portal_channel_regenerated = /** @type {(inputs: Audit_Event_Portal_Channel_RegeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrè lìnk règènèràtèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Secure link regenerated" |
*
* @param {Audit_Event_Portal_Channel_RegeneratedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_portal_channel_regenerated = /** @type {((inputs?: Audit_Event_Portal_Channel_RegeneratedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Portal_Channel_RegeneratedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_portal_channel_regenerated(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_portal_channel_regenerated(inputs)
	return en_audit_event_portal_channel_regenerated(inputs)
});