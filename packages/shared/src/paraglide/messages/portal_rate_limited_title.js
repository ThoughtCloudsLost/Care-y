/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Rate_Limited_TitleInputs */

const en_portal_rate_limited_title = /** @type {(inputs: Portal_Rate_Limited_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Taking a short pause`)
};

const es_portal_rate_limited_title = /** @type {(inputs: Portal_Rate_Limited_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una pausa breve`)
};

const en_xa2_portal_rate_limited_title = /** @type {(inputs: Portal_Rate_Limited_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàkìng à shòrt pàùsè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Taking a short pause" |
*
* @param {Portal_Rate_Limited_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_rate_limited_title = /** @type {((inputs?: Portal_Rate_Limited_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Rate_Limited_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_rate_limited_title(inputs)
	if (locale === "en-XA") return en_xa2_portal_rate_limited_title(inputs)
	return en_portal_rate_limited_title(inputs)
});