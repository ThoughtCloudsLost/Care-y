/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Retention_DescInputs */

const en_getting_started_retention_desc = /** @type {(inputs: Getting_Started_Retention_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set how long personal data is kept before automatic deletion.`)
};

const es_getting_started_retention_desc = /** @type {(inputs: Getting_Started_Retention_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Establece cuanto tiempo se conservan los datos personales antes de su eliminacion automatica.`)
};

/**
* | output |
* | --- |
* | "Set how long personal data is kept before automatic deletion." |
*
* @param {Getting_Started_Retention_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_retention_desc = /** @type {((inputs?: Getting_Started_Retention_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Retention_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_retention_desc(inputs)
	return es_getting_started_retention_desc(inputs)
});