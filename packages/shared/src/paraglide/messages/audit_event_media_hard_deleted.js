/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Media_Hard_DeletedInputs */

const en_audit_event_media_hard_deleted = /** @type {(inputs: Audit_Event_Media_Hard_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Media hard deleted`)
};

const es_audit_event_media_hard_deleted = /** @type {(inputs: Audit_Event_Media_Hard_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Medio eliminado permanentemente`)
};

const en_xa2_audit_event_media_hard_deleted = /** @type {(inputs: Audit_Event_Media_Hard_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèdìà hàrd dèlètèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Media hard deleted" |
*
* @param {Audit_Event_Media_Hard_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_media_hard_deleted = /** @type {((inputs?: Audit_Event_Media_Hard_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Media_Hard_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_media_hard_deleted(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_media_hard_deleted(inputs)
	return en_audit_event_media_hard_deleted(inputs)
});