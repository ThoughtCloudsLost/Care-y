/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Delete_Knowledge_Base_ArticlesInputs */

const en_permission_delete_knowledge_base_articles = /** @type {(inputs: Permission_Delete_Knowledge_Base_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete knowledge base articles`)
};

const es_permission_delete_knowledge_base_articles = /** @type {(inputs: Permission_Delete_Knowledge_Base_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar artículos de la base de conocimiento`)
};

/**
* | output |
* | --- |
* | "Delete knowledge base articles" |
*
* @param {Permission_Delete_Knowledge_Base_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_delete_knowledge_base_articles = /** @type {((inputs?: Permission_Delete_Knowledge_Base_ArticlesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Delete_Knowledge_Base_ArticlesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_delete_knowledge_base_articles(inputs)
	return en_permission_delete_knowledge_base_articles(inputs)
});