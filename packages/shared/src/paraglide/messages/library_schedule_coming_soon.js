/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Schedule_Coming_SoonInputs */

const en_library_schedule_coming_soon = /** @type {(inputs: Library_Schedule_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Schedule is coming soon.`)
};

const es_library_schedule_coming_soon = /** @type {(inputs: Library_Schedule_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El horario estará disponible pronto.`)
};

/**
* | output |
* | --- |
* | "Schedule is coming soon." |
*
* @param {Library_Schedule_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_schedule_coming_soon = /** @type {((inputs?: Library_Schedule_Coming_SoonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Schedule_Coming_SoonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_schedule_coming_soon(inputs)
	return es_library_schedule_coming_soon(inputs)
});