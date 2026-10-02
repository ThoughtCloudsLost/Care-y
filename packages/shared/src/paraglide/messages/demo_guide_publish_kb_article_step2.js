/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Publish_Kb_Article_Step2Inputs */

const en_demo_guide_publish_kb_article_step2 = /** @type {(inputs: Demo_Guide_Publish_Kb_Article_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap New Article and write the content in the editor. Tap Publish.`)
};

const es_demo_guide_publish_kb_article_step2 = /** @type {(inputs: Demo_Guide_Publish_Kb_Article_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca Nuevo Artículo y escribe el contenido en el editor. Toca Publicar.`)
};

const en_xa2_demo_guide_publish_kb_article_step2 = /** @type {(inputs: Demo_Guide_Publish_Kb_Article_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàp Nèw Àrtìclè ànd wrìtè thè còntènt ìn thè èdìtòr. Tàp Pùblìsh. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tap New Article and write the content in the editor. Tap Publish." |
*
* @param {Demo_Guide_Publish_Kb_Article_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_publish_kb_article_step2 = /** @type {((inputs?: Demo_Guide_Publish_Kb_Article_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Publish_Kb_Article_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_publish_kb_article_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_publish_kb_article_step2(inputs)
	return en_demo_guide_publish_kb_article_step2(inputs)
});