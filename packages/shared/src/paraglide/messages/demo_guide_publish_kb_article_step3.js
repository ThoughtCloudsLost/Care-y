/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Publish_Kb_Article_Step3Inputs */

const en_demo_guide_publish_kb_article_step3 = /** @type {(inputs: Demo_Guide_Publish_Kb_Article_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the published article from the list.`)
};

const es_demo_guide_publish_kb_article_step3 = /** @type {(inputs: Demo_Guide_Publish_Kb_Article_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el artículo publicado desde la lista.`)
};

const en_xa2_demo_guide_publish_kb_article_step3 = /** @type {(inputs: Demo_Guide_Publish_Kb_Article_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè pùblìshèd àrtìclè fròm thè lìst. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the published article from the list." |
*
* @param {Demo_Guide_Publish_Kb_Article_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_publish_kb_article_step3 = /** @type {((inputs?: Demo_Guide_Publish_Kb_Article_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Publish_Kb_Article_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_publish_kb_article_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_publish_kb_article_step3(inputs)
	return en_demo_guide_publish_kb_article_step3(inputs)
});