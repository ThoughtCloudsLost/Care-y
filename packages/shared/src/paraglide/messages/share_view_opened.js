/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_OpenedInputs */

const en_share_view_opened = /** @type {(inputs: Share_View_OpenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link has already been opened and cannot be viewed again.`)
};

const es_share_view_opened = /** @type {(inputs: Share_View_OpenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace ya fue abierto y no se puede ver de nuevo.`)
};

/**
* | output |
* | --- |
* | "This link has already been opened and cannot be viewed again." |
*
* @param {Share_View_OpenedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_opened = /** @type {((inputs?: Share_View_OpenedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_OpenedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_view_opened(inputs)
	return es_share_view_opened(inputs)
});