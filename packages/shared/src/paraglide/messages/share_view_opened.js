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

const en_xa2_share_view_opened = /** @type {(inputs: Share_View_OpenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs lìnk hàs àlrèàdy bèèn òpènèd ànd cànnòt bè vìèwèd àgàìn. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This link has already been opened and cannot be viewed again." |
*
* @param {Share_View_OpenedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_opened = /** @type {((inputs?: Share_View_OpenedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_OpenedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_view_opened(inputs)
	if (locale === "en-XA") return en_xa2_share_view_opened(inputs)
	return en_share_view_opened(inputs)
});