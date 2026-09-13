/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Merge_Lock_ChangedInputs */

const en_audit_event_merge_lock_changed = /** @type {(inputs: Audit_Event_Merge_Lock_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merge lock changed`)
};

const es_audit_event_merge_lock_changed = /** @type {(inputs: Audit_Event_Merge_Lock_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloqueo de fusion cambiado`)
};

/**
* | output |
* | --- |
* | "Merge lock changed" |
*
* @param {Audit_Event_Merge_Lock_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_merge_lock_changed = /** @type {((inputs?: Audit_Event_Merge_Lock_ChangedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Merge_Lock_ChangedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_merge_lock_changed(inputs)
	return es_audit_event_merge_lock_changed(inputs)
});