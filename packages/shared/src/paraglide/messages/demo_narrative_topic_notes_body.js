/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Notes_BodyInputs */

const en_demo_narrative_topic_notes_body = /** @type {(inputs: Demo_Narrative_Topic_Notes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notes are visible only to volunteers and are encrypted with the same per-ticket key. The server cannot distinguish a note from a message. Only your browser knows which entries are notes.`)
};

const es_demo_narrative_topic_notes_body = /** @type {(inputs: Demo_Narrative_Topic_Notes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las notas solo son visibles para voluntarios y se cifran con la misma clave por ticket. El servidor no puede distinguir una nota de un mensaje. Solo tu navegador sabe cuales entradas son notas.`)
};

/**
* | output |
* | --- |
* | "Notes are visible only to volunteers and are encrypted with the same per-ticket key. The server cannot distinguish a note from a message. Only your browser k..." |
*
* @param {Demo_Narrative_Topic_Notes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_notes_body = /** @type {((inputs?: Demo_Narrative_Topic_Notes_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Notes_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_notes_body(inputs)
	return es_demo_narrative_topic_notes_body(inputs)
});