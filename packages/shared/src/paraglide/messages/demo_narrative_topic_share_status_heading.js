/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Share_Status_HeadingInputs */

const en_demo_narrative_topic_share_status_heading = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share link status`)
};

const es_demo_narrative_topic_share_status_heading = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estado del enlace compartido`)
};

const en_xa2_demo_narrative_topic_share_status_heading = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shàrè lìnk stàtùs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Share link status" |
*
* @param {Demo_Narrative_Topic_Share_Status_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_share_status_heading = /** @type {((inputs?: Demo_Narrative_Topic_Share_Status_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Share_Status_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_share_status_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_share_status_heading(inputs)
	return en_demo_narrative_topic_share_status_heading(inputs)
});