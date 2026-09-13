/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Dead_Link_TitleInputs */

const en_portal_dead_link_title = /** @type {(inputs: Portal_Dead_Link_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Expired link`)
};

const es_portal_dead_link_title = /** @type {(inputs: Portal_Dead_Link_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace caducado`)
};

/**
* | output |
* | --- |
* | "Expired link" |
*
* @param {Portal_Dead_Link_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_dead_link_title = /** @type {((inputs?: Portal_Dead_Link_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Dead_Link_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_dead_link_title(inputs)
	return es_portal_dead_link_title(inputs)
});