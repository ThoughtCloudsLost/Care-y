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

const en_xa2_demo_narrative_topic_new_ticket_heading = /** @type {(inputs: Demo_Narrative_Topic_New_Ticket_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtìng à nèw tìckèt •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Creating a new ticket" |
*
* @param {Demo_Narrative_Topic_New_Ticket_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_new_ticket_heading = /** @type {((inputs?: Demo_Narrative_Topic_New_Ticket_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_New_Ticket_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_new_ticket_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_new_ticket_heading(inputs)
	return en_demo_narrative_topic_new_ticket_heading(inputs)
});