/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_New_Ticket_HeadingInputs */

const en_demo_narrative_topic_new_ticket_heading = /** @type {(inputs: Demo_Narrative_Topic_New_Ticket_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creating a new ticket`)
};

const es_demo_narrative_topic_new_ticket_heading = /** @type {(inputs: Demo_Narrative_Topic_New_Ticket_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creando un nuevo ticket`)
};

/**
* | output |
* | --- |
* | "Creating a new ticket" |
*
* @param {Demo_Narrative_Topic_New_Ticket_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_new_ticket_heading = /** @type {((inputs?: Demo_Narrative_Topic_New_Ticket_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_New_Ticket_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_new_ticket_heading(inputs)
	return es_demo_narrative_topic_new_ticket_heading(inputs)
});