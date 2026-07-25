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

/**
* | output |
* | --- |
* | "Note" |
*
* @param {Demo_Conversation_Note_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_note_label = /** @type {((inputs?: Demo_Conversation_Note_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Conversation_Note_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_conversation_note_label(inputs)
	return es_demo_conversation_note_label(inputs)
});