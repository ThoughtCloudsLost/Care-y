/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Greetings_DescInputs */

const en_getting_started_greetings_desc = /** @type {(inputs: Getting_Started_Greetings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Record what callers hear when they call in. Covers welcome messages and hold music.`)
};

const es_getting_started_greetings_desc = /** @type {(inputs: Getting_Started_Greetings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Graba lo que escuchan las personas que llaman, incluyendo musica de espera.`)
};

/**
* | output |
* | --- |
* | "Record what callers hear when they call in. Covers welcome messages and hold music." |
*
* @param {Getting_Started_Greetings_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_greetings_desc = /** @type {((inputs?: Getting_Started_Greetings_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Greetings_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_greetings_desc(inputs)
	return es_getting_started_greetings_desc(inputs)
});