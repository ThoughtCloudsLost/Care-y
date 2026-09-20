/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_NotesInputs */

const en_demo_topic_notes = /** @type {(inputs: Demo_Topic_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Internal notes`)
};

const es_demo_topic_notes = /** @type {(inputs: Demo_Topic_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notas internas`)
};

const en_xa2_demo_topic_notes = /** @type {(inputs: Demo_Topic_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntèrnàl nòtès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Internal notes" |
*
* @param {Demo_Topic_NotesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_notes = /** @type {((inputs?: Demo_Topic_NotesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_NotesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_notes(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_notes(inputs)
	return en_demo_topic_notes(inputs)
});