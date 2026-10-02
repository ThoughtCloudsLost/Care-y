/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Publish_Kb_Article_TitleInputs */

const en_demo_guide_publish_kb_article_title = /** @type {(inputs: Demo_Guide_Publish_Kb_Article_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Publish an article`)
};

const es_demo_guide_publish_kb_article_title = /** @type {(inputs: Demo_Guide_Publish_Kb_Article_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Publicar un artículo`)
};

const en_xa2_demo_guide_publish_kb_article_title = /** @type {(inputs: Demo_Guide_Publish_Kb_Article_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pùblìsh àn àrtìclè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Publish an article" |
*
* @param {Demo_Guide_Publish_Kb_Article_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_publish_kb_article_title = /** @type {((inputs?: Demo_Guide_Publish_Kb_Article_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Publish_Kb_Article_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_publish_kb_article_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_publish_kb_article_title(inputs)
	return en_demo_guide_publish_kb_article_title(inputs)
});