/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Contact_None_NoteInputs */

const en_intake_contact_none_note = /** @type {(inputs: Intake_Contact_None_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization will not be able to reach out to you.`)
};

const es_intake_contact_none_note = /** @type {(inputs: Intake_Contact_None_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La organización no podrá comunicarse contigo.`)
};

const en_xa2_intake_contact_none_note = /** @type {(inputs: Intake_Contact_None_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè òrgànìzàtìòn wìll nòt bè àblè tò rèàch òùt tò yòù. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The organization will not be able to reach out to you." |
*
* @param {Intake_Contact_None_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_contact_none_note = /** @type {((inputs?: Intake_Contact_None_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Contact_None_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_contact_none_note(inputs)
	if (locale === "en-XA") return en_xa2_intake_contact_none_note(inputs)
	return en_intake_contact_none_note(inputs)
});