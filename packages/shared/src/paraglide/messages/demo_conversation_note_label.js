/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Conversation_Note_LabelInputs */

const en_demo_conversation_note_label = /** @type {(inputs: Demo_Conversation_Note_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note`)
};

const es_demo_conversation_note_label = /** @type {(inputs: Demo_Conversation_Note_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nota`)
};

const en_xa2_demo_conversation_note_label = /** @type {(inputs: Demo_Conversation_Note_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtè ••⟧`)
};

/**
* | output |
* | --- |
* | "Note" |
*
* @param {Demo_Conversation_Note_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_note_label = /** @type {((inputs?: Demo_Conversation_Note_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Conversation_Note_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_conversation_note_label(inputs)
	if (locale === "en-XA") return en_xa2_demo_conversation_note_label(inputs)
	return en_demo_conversation_note_label(inputs)
});