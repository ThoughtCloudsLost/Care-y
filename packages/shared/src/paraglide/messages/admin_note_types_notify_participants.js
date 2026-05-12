/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown>, ticket: NonNullable<unknown> }} Admin_Note_Types_Notify_ParticipantsInputs */

const en_admin_note_types_notify_participants = /** @type {(inputs: Admin_Note_Types_Notify_ParticipantsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} participants`)
};

const es_admin_note_types_notify_participants = /** @type {(inputs: Admin_Note_Types_Notify_ParticipantsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Participantes del ${i?.ticket}`)
};

/**
* | output |
* | --- |
* | "{Ticket} participants" |
*
* @param {Admin_Note_Types_Notify_ParticipantsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_notify_participants = /** @type {((inputs: Admin_Note_Types_Notify_ParticipantsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Notify_ParticipantsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_notify_participants(inputs)
	return es_admin_note_types_notify_participants(inputs)
});