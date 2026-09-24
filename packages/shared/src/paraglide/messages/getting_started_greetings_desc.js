/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Greetings_DescInputs */

const en_getting_started_greetings_desc = /** @type {(inputs: Getting_Started_Greetings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Record what callers hear when they call in. Covers welcome messages and hold music.`)
};

const es_getting_started_greetings_desc = /** @type {(inputs: Getting_Started_Greetings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Graba lo que escuchan las personas que llaman, incluyendo música de espera.`)
};

const en_xa2_getting_started_greetings_desc = /** @type {(inputs: Getting_Started_Greetings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòrd whàt càllèrs hèàr whèn thèy càll ìn. Còvèrs wèlcòmè mèssàgès ànd hòld mùsìc. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Record what callers hear when they call in. Covers welcome messages and hold music." |
*
* @param {Getting_Started_Greetings_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_greetings_desc = /** @type {((inputs?: Getting_Started_Greetings_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Greetings_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_greetings_desc(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_greetings_desc(inputs)
	return en_getting_started_greetings_desc(inputs)
});