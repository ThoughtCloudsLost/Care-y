/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Portal_History_Reseed_ChunkInputs */

const en_audit_event_portal_history_reseed_chunk = /** @type {(inputs: Audit_Event_Portal_History_Reseed_ChunkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Message history recovered to secure link`)
};

const es_audit_event_portal_history_reseed_chunk = /** @type {(inputs: Audit_Event_Portal_History_Reseed_ChunkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Historial de mensajes recuperado al enlace seguro`)
};

const en_xa2_audit_event_portal_history_reseed_chunk = /** @type {(inputs: Audit_Event_Portal_History_Reseed_ChunkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèssàgè hìstòry rècòvèrèd tò sècùrè lìnk ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Message history recovered to secure link" |
*
* @param {Audit_Event_Portal_History_Reseed_ChunkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_portal_history_reseed_chunk = /** @type {((inputs?: Audit_Event_Portal_History_Reseed_ChunkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Portal_History_Reseed_ChunkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_portal_history_reseed_chunk(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_portal_history_reseed_chunk(inputs)
	return en_audit_event_portal_history_reseed_chunk(inputs)
});