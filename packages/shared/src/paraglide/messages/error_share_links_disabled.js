/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Share_Links_DisabledInputs */

const en_error_share_links_disabled = /** @type {(inputs: Error_Share_Links_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share links are not enabled for this organization.`)
};

const es_error_share_links_disabled = /** @type {(inputs: Error_Share_Links_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los enlaces compartidos no están habilitados para esta organización.`)
};

const en_xa2_error_share_links_disabled = /** @type {(inputs: Error_Share_Links_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shàrè lìnks àrè nòt ènàblèd fòr thìs òrgànìzàtìòn. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Share links are not enabled for this organization." |
*
* @param {Error_Share_Links_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_share_links_disabled = /** @type {((inputs?: Error_Share_Links_DisabledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Share_Links_DisabledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_share_links_disabled(inputs)
	if (locale === "en-XA") return en_xa2_error_share_links_disabled(inputs)
	return en_error_share_links_disabled(inputs)
});