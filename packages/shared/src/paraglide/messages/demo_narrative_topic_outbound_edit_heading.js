/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Outbound_Edit_HeadingInputs */

const en_demo_narrative_topic_outbound_edit_heading = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit sent message`)
};

const es_demo_narrative_topic_outbound_edit_heading = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar mensaje enviado`)
};

/**
* | output |
* | --- |
* | "Edit sent message" |
*
* @param {Demo_Narrative_Topic_Outbound_Edit_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_outbound_edit_heading = /** @type {((inputs?: Demo_Narrative_Topic_Outbound_Edit_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Outbound_Edit_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_outbound_edit_heading(inputs)
	return en_demo_narrative_topic_outbound_edit_heading(inputs)
});