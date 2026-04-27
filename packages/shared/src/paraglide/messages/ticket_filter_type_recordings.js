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

/**
* | output |
* | --- |
* | "Voicemails" |
*
* @param {Ticket_Filter_Type_RecordingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_recordings = /** @type {((inputs?: Ticket_Filter_Type_RecordingsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_RecordingsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_filter_type_recordings(inputs)
	return es_ticket_filter_type_recordings(inputs)
});