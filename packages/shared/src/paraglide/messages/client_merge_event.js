/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ alias: NonNullable<unknown> }} Client_Merge_EventInputs */

const en_client_merge_event = /** @type {(inputs: Client_Merge_EventInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.alias} merged here`)
};

const es_client_merge_event = /** @type {(inputs: Client_Merge_EventInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.alias} fusionado aqui`)
};

/**
* | output |
* | --- |
* | "{alias} merged here" |
*
* @param {Client_Merge_EventInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_event = /** @type {((inputs: Client_Merge_EventInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_EventInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_event(inputs)
	return es_client_merge_event(inputs)
});