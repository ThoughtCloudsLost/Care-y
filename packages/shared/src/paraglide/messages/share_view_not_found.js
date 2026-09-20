/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_Not_FoundInputs */

const en_share_view_not_found = /** @type {(inputs: Share_View_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link was not found. It may have already expired.`)
};

const es_share_view_not_found = /** @type {(inputs: Share_View_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se encontró este enlace. Es posible que ya haya expirado.`)
};

const en_xa2_share_view_not_found = /** @type {(inputs: Share_View_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs lìnk wàs nòt fòùnd. Ìt mày hàvè àlrèàdy èxpìrèd. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This link was not found. It may have already expired." |
*
* @param {Share_View_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_not_found = /** @type {((inputs?: Share_View_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_view_not_found(inputs)
	if (locale === "en-XA") return en_xa2_share_view_not_found(inputs)
	return en_share_view_not_found(inputs)
});