/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Share_Link_HeadingInputs */

const en_demo_narrative_topic_share_link_heading = /** @type {(inputs: Demo_Narrative_Topic_Share_Link_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share link`)
};

const es_demo_narrative_topic_share_link_heading = /** @type {(inputs: Demo_Narrative_Topic_Share_Link_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace compartido`)
};

const en_xa2_demo_narrative_topic_share_link_heading = /** @type {(inputs: Demo_Narrative_Topic_Share_Link_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shàrè lìnk •••⟧`)
};

/**
* | output |
* | --- |
* | "Share link" |
*
* @param {Demo_Narrative_Topic_Share_Link_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_share_link_heading = /** @type {((inputs?: Demo_Narrative_Topic_Share_Link_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Share_Link_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_share_link_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_share_link_heading(inputs)
	return en_demo_narrative_topic_share_link_heading(inputs)
});