/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Note_Type_CreatedInputs */

const en_audit_event_note_type_created = /** @type {(inputs: Audit_Event_Note_Type_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note type created`)
};

const es_audit_event_note_type_created = /** @type {(inputs: Audit_Event_Note_Type_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de nota creado`)
};

/**
* | output |
* | --- |
* | "Note type created" |
*
* @param {Audit_Event_Note_Type_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_note_type_created = /** @type {((inputs?: Audit_Event_Note_Type_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Note_Type_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_note_type_created(inputs)
	return es_audit_event_note_type_created(inputs)
});