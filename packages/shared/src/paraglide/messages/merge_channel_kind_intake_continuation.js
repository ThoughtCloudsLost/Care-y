/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Merge_Channel_Kind_Intake_ContinuationInputs */

const en_merge_channel_kind_intake_continuation = /** @type {(inputs: Merge_Channel_Kind_Intake_ContinuationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Created at intake`)
};

const es_merge_channel_kind_intake_continuation = /** @type {(inputs: Merge_Channel_Kind_Intake_ContinuationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creado en el ingreso`)
};

const en_xa2_merge_channel_kind_intake_continuation = /** @type {(inputs: Merge_Channel_Kind_Intake_ContinuationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtèd àt ìntàkè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Created at intake" |
*
* @param {Merge_Channel_Kind_Intake_ContinuationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const merge_channel_kind_intake_continuation = /** @type {((inputs?: Merge_Channel_Kind_Intake_ContinuationInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Merge_Channel_Kind_Intake_ContinuationInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_merge_channel_kind_intake_continuation(inputs)
	if (locale === "en-XA") return en_xa2_merge_channel_kind_intake_continuation(inputs)
	return en_merge_channel_kind_intake_continuation(inputs)
});