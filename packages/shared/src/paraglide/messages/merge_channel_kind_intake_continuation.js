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

/**
* | output |
* | --- |
* | "Created at intake" |
*
* @param {Merge_Channel_Kind_Intake_ContinuationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_kind_intake_continuation = /** @type {((inputs?: Merge_Channel_Kind_Intake_ContinuationInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Merge_Channel_Kind_Intake_ContinuationInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_merge_channel_kind_intake_continuation(inputs)
	return es_merge_channel_kind_intake_continuation(inputs)
});