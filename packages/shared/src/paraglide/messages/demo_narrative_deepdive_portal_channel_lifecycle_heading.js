/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Portal_Channel_Lifecycle_HeadingInputs */

const en_demo_narrative_deepdive_portal_channel_lifecycle_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Portal_Channel_Lifecycle_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The portal channel lifecycle`)
};

const es_demo_narrative_deepdive_portal_channel_lifecycle_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Portal_Channel_Lifecycle_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El ciclo de vida del canal del portal`)
};

/**
* | output |
* | --- |
* | "The portal channel lifecycle" |
*
* @param {Demo_Narrative_Deepdive_Portal_Channel_Lifecycle_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_portal_channel_lifecycle_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_Portal_Channel_Lifecycle_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Portal_Channel_Lifecycle_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_portal_channel_lifecycle_heading(inputs)
	return en_demo_narrative_deepdive_portal_channel_lifecycle_heading(inputs)
});