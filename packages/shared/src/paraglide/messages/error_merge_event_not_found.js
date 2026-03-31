/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Merge_Event_Not_FoundInputs */

const en_error_merge_event_not_found = /** @type {(inputs: Error_Merge_Event_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merge event not found.`)
};

const es_error_merge_event_not_found = /** @type {(inputs: Error_Merge_Event_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Evento de fusión no encontrado.`)
};

/**
* | output |
* | --- |
* | "Merge event not found." |
*
* @param {Error_Merge_Event_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_merge_event_not_found = /** @type {((inputs?: Error_Merge_Event_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Merge_Event_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_merge_event_not_found(inputs)
	return es_error_merge_event_not_found(inputs)
});