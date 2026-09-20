/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Note_Type_UpdatedInputs */

const en_audit_event_note_type_updated = /** @type {(inputs: Audit_Event_Note_Type_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note type updated`)
};

const es_audit_event_note_type_updated = /** @type {(inputs: Audit_Event_Note_Type_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de nota actualizado`)
};

const en_xa2_audit_event_note_type_updated = /** @type {(inputs: Audit_Event_Note_Type_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtè typè ùpdàtèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Note type updated" |
*
* @param {Audit_Event_Note_Type_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_note_type_updated = /** @type {((inputs?: Audit_Event_Note_Type_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Note_Type_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_note_type_updated(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_note_type_updated(inputs)
	return en_audit_event_note_type_updated(inputs)
});