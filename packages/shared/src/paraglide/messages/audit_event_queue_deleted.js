/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Queue_DeletedInputs */

const en_audit_event_queue_deleted = /** @type {(inputs: Audit_Event_Queue_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue deleted`)
};

const es_audit_event_queue_deleted = /** @type {(inputs: Audit_Event_Queue_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cola eliminada`)
};

const en_xa2_audit_event_queue_deleted = /** @type {(inputs: Audit_Event_Queue_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Qùèùè dèlètèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Queue deleted" |
*
* @param {Audit_Event_Queue_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_queue_deleted = /** @type {((inputs?: Audit_Event_Queue_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Queue_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_queue_deleted(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_queue_deleted(inputs)
	return en_audit_event_queue_deleted(inputs)
});