/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Merge_Channel_Choice_ExplainInputs */

const en_merge_channel_choice_explain = /** @type {(inputs: Merge_Channel_Choice_ExplainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only one link can stay active after the merge. The other link will stop working.`)
};

const es_merge_channel_choice_explain = /** @type {(inputs: Merge_Channel_Choice_ExplainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo un enlace puede permanecer activo después de la combinación. El otro enlace dejará de funcionar.`)
};

/**
* | output |
* | --- |
* | "Only one link can stay active after the merge. The other link will stop working." |
*
* @param {Merge_Channel_Choice_ExplainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_choice_explain = /** @type {((inputs?: Merge_Channel_Choice_ExplainInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Merge_Channel_Choice_ExplainInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_merge_channel_choice_explain(inputs)
	return es_merge_channel_choice_explain(inputs)
});