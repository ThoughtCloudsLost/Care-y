/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_TitleInputs */

const en_portal_title = /** @type {(inputs: Portal_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Messages`)
};

const es_portal_title = /** @type {(inputs: Portal_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensajes`)
};

/**
* | output |
* | --- |
* | "Messages" |
*
* @param {Portal_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_title = /** @type {((inputs?: Portal_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_title(inputs)
	return es_portal_title(inputs)
});