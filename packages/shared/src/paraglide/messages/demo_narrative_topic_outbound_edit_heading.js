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

const en_xa2_demo_narrative_topic_outbound_edit_heading = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt sènt mèssàgè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Edit sent message" |
*
* @param {Demo_Narrative_Topic_Outbound_Edit_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_outbound_edit_heading = /** @type {((inputs?: Demo_Narrative_Topic_Outbound_Edit_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Outbound_Edit_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_outbound_edit_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_outbound_edit_heading(inputs)
	return en_demo_narrative_topic_outbound_edit_heading(inputs)
});