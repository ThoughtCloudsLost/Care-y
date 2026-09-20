/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Merge_Lock_ChangedInputs */

const en_audit_event_merge_lock_changed = /** @type {(inputs: Audit_Event_Merge_Lock_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merge lock changed`)
};

const es_audit_event_merge_lock_changed = /** @type {(inputs: Audit_Event_Merge_Lock_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloqueo de fusión cambiado`)
};

const en_xa2_audit_event_merge_lock_changed = /** @type {(inputs: Audit_Event_Merge_Lock_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèrgè lòck chàngèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Merge lock changed" |
*
* @param {Audit_Event_Merge_Lock_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_merge_lock_changed = /** @type {((inputs?: Audit_Event_Merge_Lock_ChangedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Merge_Lock_ChangedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_merge_lock_changed(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_merge_lock_changed(inputs)
	return en_audit_event_merge_lock_changed(inputs)
});