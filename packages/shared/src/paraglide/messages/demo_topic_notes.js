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

/**
* | output |
* | --- |
* | "Internal notes" |
*
* @param {Demo_Topic_NotesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_notes = /** @type {((inputs?: Demo_Topic_NotesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_NotesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_notes(inputs)
	return es_demo_topic_notes(inputs)
});