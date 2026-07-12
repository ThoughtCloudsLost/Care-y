/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ query: NonNullable<unknown> }} Search_Empty_PeopleInputs */

const en_search_empty_people = /** @type {(inputs: Search_Empty_PeopleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No teammates match "${i?.query}".`)
};

const es_search_empty_people = /** @type {(inputs: Search_Empty_PeopleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No hay compañeros que coincidan con "${i?.query}".`)
};

/**
* | output |
* | --- |
* | "No teammates match \"{query}\"." |
*
* @param {Search_Empty_PeopleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_empty_people = /** @type {((inputs: Search_Empty_PeopleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Empty_PeopleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_empty_people(inputs)
	return es_search_empty_people(inputs)
});