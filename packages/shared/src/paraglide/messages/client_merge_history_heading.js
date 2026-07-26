/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Merge_History_HeadingInputs */

const en_client_merge_history_heading = /** @type {(inputs: Client_Merge_History_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merge history`)
};

const es_client_merge_history_heading = /** @type {(inputs: Client_Merge_History_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Historial de fusiones`)
};

/**
* | output |
* | --- |
* | "Merge history" |
*
* @param {Client_Merge_History_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_history_heading = /** @type {((inputs?: Client_Merge_History_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_History_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_history_heading(inputs)
	return es_client_merge_history_heading(inputs)
});