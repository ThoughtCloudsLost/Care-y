/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ date: NonNullable<unknown> }} Merge_Channel_CreatedInputs */

const en_merge_channel_created = /** @type {(inputs: Merge_Channel_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Created ${i?.date}`)
};

const es_merge_channel_created = /** @type {(inputs: Merge_Channel_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Creado el ${i?.date}`)
};

/**
* | output |
* | --- |
* | "Created {date}" |
*
* @param {Merge_Channel_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_created = /** @type {((inputs: Merge_Channel_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Merge_Channel_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_merge_channel_created(inputs)
	return es_merge_channel_created(inputs)
});