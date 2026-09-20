/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Knowledge_BaseInputs */

const en_permission_view_knowledge_base = /** @type {(inputs: Permission_View_Knowledge_BaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View knowledge base`)
};

const es_permission_view_knowledge_base = /** @type {(inputs: Permission_View_Knowledge_BaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver base de conocimiento`)
};

const en_xa2_permission_view_knowledge_base = /** @type {(inputs: Permission_View_Knowledge_BaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw knòwlèdgè bàsè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "View knowledge base" |
*
* @param {Permission_View_Knowledge_BaseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_view_knowledge_base = /** @type {((inputs?: Permission_View_Knowledge_BaseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Knowledge_BaseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_knowledge_base(inputs)
	if (locale === "en-XA") return en_xa2_permission_view_knowledge_base(inputs)
	return en_permission_view_knowledge_base(inputs)
});