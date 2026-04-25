/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Summary_ParticipantsInputs */

const en_admin_note_types_summary_participants = /** @type {(inputs: Admin_Note_Types_Summary_ParticipantsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`participants`)
};

const es_admin_note_types_summary_participants = /** @type {(inputs: Admin_Note_Types_Summary_ParticipantsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`participantes`)
};

/**
* | output |
* | --- |
* | "participants" |
*
* @param {Admin_Note_Types_Summary_ParticipantsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_summary_participants = /** @type {((inputs?: Admin_Note_Types_Summary_ParticipantsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Summary_ParticipantsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_summary_participants(inputs)
	return es_admin_note_types_summary_participants(inputs)
});