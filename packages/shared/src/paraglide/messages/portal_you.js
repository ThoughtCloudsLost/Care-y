/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_YouInputs */

const en_portal_you = /** @type {(inputs: Portal_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You`)
};

const es_portal_you = /** @type {(inputs: Portal_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tú`)
};

/**
* | output |
* | --- |
* | "You" |
*
* @param {Portal_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_you = /** @type {((inputs?: Portal_YouInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_YouInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_you(inputs)
	return es_portal_you(inputs)
});