/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Contact_None_NoteInputs */

const en_intake_contact_none_note = /** @type {(inputs: Intake_Contact_None_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization will not be able to reach out to you.`)
};

const es_intake_contact_none_note = /** @type {(inputs: Intake_Contact_None_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La organizacion no podra comunicarse contigo.`)
};

/**
* | output |
* | --- |
* | "The organization will not be able to reach out to you." |
*
* @param {Intake_Contact_None_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_contact_none_note = /** @type {((inputs?: Intake_Contact_None_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Contact_None_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_contact_none_note(inputs)
	return es_intake_contact_none_note(inputs)
});