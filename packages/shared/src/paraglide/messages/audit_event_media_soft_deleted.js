/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Media_Soft_DeletedInputs */

const en_audit_event_media_soft_deleted = /** @type {(inputs: Audit_Event_Media_Soft_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Media soft deleted`)
};

const es_audit_event_media_soft_deleted = /** @type {(inputs: Audit_Event_Media_Soft_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Medio eliminado temporalmente`)
};

const en_xa2_audit_event_media_soft_deleted = /** @type {(inputs: Audit_Event_Media_Soft_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèdìà sòft dèlètèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Media soft deleted" |
*
* @param {Audit_Event_Media_Soft_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_media_soft_deleted = /** @type {((inputs?: Audit_Event_Media_Soft_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Media_Soft_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_media_soft_deleted(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_media_soft_deleted(inputs)
	return en_audit_event_media_soft_deleted(inputs)
});