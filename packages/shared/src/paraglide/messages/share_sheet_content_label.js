/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_Content_LabelInputs */

const en_share_sheet_content_label = /** @type {(inputs: Share_Sheet_Content_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Content`)
};

const es_share_sheet_content_label = /** @type {(inputs: Share_Sheet_Content_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contenido`)
};

const en_xa2_share_sheet_content_label = /** @type {(inputs: Share_Sheet_Content_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còntènt •••⟧`)
};

/**
* | output |
* | --- |
* | "Content" |
*
* @param {Share_Sheet_Content_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sheet_content_label = /** @type {((inputs?: Share_Sheet_Content_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_Content_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_sheet_content_label(inputs)
	if (locale === "en-XA") return en_xa2_share_sheet_content_label(inputs)
	return en_share_sheet_content_label(inputs)
});