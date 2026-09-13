/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Timezone_SearchInputs */

const en_intake_avail_timezone_search = /** @type {(inputs: Intake_Avail_Timezone_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search timezones...`)
};

const es_intake_avail_timezone_search = /** @type {(inputs: Intake_Avail_Timezone_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar zonas horarias...`)
};

/**
* | output |
* | --- |
* | "Search timezones..." |
*
* @param {Intake_Avail_Timezone_SearchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_timezone_search = /** @type {((inputs?: Intake_Avail_Timezone_SearchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Timezone_SearchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_timezone_search(inputs)
	return es_intake_avail_timezone_search(inputs)
});