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

/**
* | output |
* | --- |
* | "Media soft deleted" |
*
* @param {Audit_Event_Media_Soft_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_media_soft_deleted = /** @type {((inputs?: Audit_Event_Media_Soft_DeletedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Media_Soft_DeletedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_media_soft_deleted(inputs)
	return es_audit_event_media_soft_deleted(inputs)
});