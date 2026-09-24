/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Notes_HeadingInputs */

const en_demo_narrative_topic_notes_heading = /** @type {(inputs: Demo_Narrative_Topic_Notes_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Internal notes`)
};

const es_demo_narrative_topic_notes_heading = /** @type {(inputs: Demo_Narrative_Topic_Notes_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notas internas`)
};

const en_xa2_demo_narrative_topic_notes_heading = /** @type {(inputs: Demo_Narrative_Topic_Notes_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntèrnàl nòtès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Internal notes" |
*
* @param {Demo_Narrative_Topic_Notes_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_notes_heading = /** @type {((inputs?: Demo_Narrative_Topic_Notes_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Notes_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_notes_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_notes_heading(inputs)
	return en_demo_narrative_topic_notes_heading(inputs)
});