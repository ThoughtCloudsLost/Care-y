/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Merge_Channel_Kind_AccountInputs */

const en_merge_channel_kind_account = /** @type {(inputs: Merge_Channel_Kind_AccountInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account`)
};

const es_merge_channel_kind_account = /** @type {(inputs: Merge_Channel_Kind_AccountInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuenta`)
};

/**
* | output |
* | --- |
* | "Account" |
*
* @param {Merge_Channel_Kind_AccountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_kind_account = /** @type {((inputs?: Merge_Channel_Kind_AccountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Merge_Channel_Kind_AccountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_merge_channel_kind_account(inputs)
	return es_merge_channel_kind_account(inputs)
});