/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Retention_DescInputs */

const en_getting_started_retention_desc = /** @type {(inputs: Getting_Started_Retention_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set how long personal data is kept before automatic deletion.`)
};

const es_getting_started_retention_desc = /** @type {(inputs: Getting_Started_Retention_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Establece cuánto tiempo se conservan los datos personales antes de su eliminación automática.`)
};

const en_xa2_getting_started_retention_desc = /** @type {(inputs: Getting_Started_Retention_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt hòw lòng pèrsònàl dàtà ìs kèpt bèfòrè àùtòmàtìc dèlètìòn. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Set how long personal data is kept before automatic deletion." |
*
* @param {Getting_Started_Retention_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_retention_desc = /** @type {((inputs?: Getting_Started_Retention_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Retention_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_retention_desc(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_retention_desc(inputs)
	return en_getting_started_retention_desc(inputs)
});