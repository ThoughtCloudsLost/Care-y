/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Incomplete_Link_TitleInputs */

const en_portal_incomplete_link_title = /** @type {(inputs: Portal_Incomplete_Link_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Incomplete link`)
};

const es_portal_incomplete_link_title = /** @type {(inputs: Portal_Incomplete_Link_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace incompleto`)
};

/**
* | output |
* | --- |
* | "Incomplete link" |
*
* @param {Portal_Incomplete_Link_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_incomplete_link_title = /** @type {((inputs?: Portal_Incomplete_Link_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Incomplete_Link_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_incomplete_link_title(inputs)
	return en_portal_incomplete_link_title(inputs)
});