/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Queue_CreatedInputs */

const en_audit_event_queue_created = /** @type {(inputs: Audit_Event_Queue_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue created`)
};

const es_audit_event_queue_created = /** @type {(inputs: Audit_Event_Queue_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cola creada`)
};

const en_xa2_audit_event_queue_created = /** @type {(inputs: Audit_Event_Queue_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Qùèùè crèàtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Queue created" |
*
* @param {Audit_Event_Queue_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_queue_created = /** @type {((inputs?: Audit_Event_Queue_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Queue_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_queue_created(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_queue_created(inputs)
	return en_audit_event_queue_created(inputs)
});