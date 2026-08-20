/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Portal_Channel_RevokedInputs */

const en_audit_event_portal_channel_revoked = /** @type {(inputs: Audit_Event_Portal_Channel_RevokedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure link removed`)
};

const es_audit_event_portal_channel_revoked = /** @type {(inputs: Audit_Event_Portal_Channel_RevokedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace seguro eliminado`)
};

/**
* | output |
* | --- |
* | "Secure link removed" |
*
* @param {Audit_Event_Portal_Channel_RevokedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_portal_channel_revoked = /** @type {((inputs?: Audit_Event_Portal_Channel_RevokedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Portal_Channel_RevokedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_portal_channel_revoked(inputs)
	return es_audit_event_portal_channel_revoked(inputs)
});