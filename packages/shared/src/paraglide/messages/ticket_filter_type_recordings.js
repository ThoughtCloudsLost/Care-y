/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_RecordingsInputs */

const en_ticket_filter_type_recordings = /** @type {(inputs: Ticket_Filter_Type_RecordingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemails`)
};

const es_ticket_filter_type_recordings = /** @type {(inputs: Ticket_Filter_Type_RecordingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buzones de voz`)
};

const en_xa2_ticket_filter_type_recordings = /** @type {(inputs: Ticket_Filter_Type_RecordingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòìcèmàìls •••⟧`)
};

/**
* | output |
* | --- |
* | "Voicemails" |
*
* @param {Ticket_Filter_Type_RecordingsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_recordings = /** @type {((inputs?: Ticket_Filter_Type_RecordingsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_RecordingsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type_recordings(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_type_recordings(inputs)
	return en_ticket_filter_type_recordings(inputs)
});