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

const en_xa2_vol_access_kb = /** @type {(inputs: Vol_Access_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bròwsè thè Knòwlèdgè Bàsè ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Browse the Knowledge Base" |
*
* @param {Vol_Access_KbInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_access_kb = /** @type {((inputs?: Vol_Access_KbInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Access_KbInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_access_kb(inputs)
	if (locale === "en-XA") return en_xa2_vol_access_kb(inputs)
	return en_vol_access_kb(inputs)
});