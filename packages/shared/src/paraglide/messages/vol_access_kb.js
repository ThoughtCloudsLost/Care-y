/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Access_KbInputs */

const en_vol_access_kb = /** @type {(inputs: Vol_Access_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Browse the Knowledge Base`)
};

const es_vol_access_kb = /** @type {(inputs: Vol_Access_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Explorar la Base de Conocimiento`)
};

/**
* | output |
* | --- |
* | "Browse the Knowledge Base" |
*
* @param {Vol_Access_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_access_kb = /** @type {((inputs?: Vol_Access_KbInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Access_KbInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_access_kb(inputs)
	return es_vol_access_kb(inputs)
});