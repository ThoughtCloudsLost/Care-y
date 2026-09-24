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

const en_xa2_permission_delete_knowledge_base_articles = /** @type {(inputs: Permission_Delete_Knowledge_Base_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè knòwlèdgè bàsè àrtìclès •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete knowledge base articles" |
*
* @param {Permission_Delete_Knowledge_Base_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_delete_knowledge_base_articles = /** @type {((inputs?: Permission_Delete_Knowledge_Base_ArticlesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Delete_Knowledge_Base_ArticlesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_delete_knowledge_base_articles(inputs)
	if (locale === "en-XA") return en_xa2_permission_delete_knowledge_base_articles(inputs)
	return en_permission_delete_knowledge_base_articles(inputs)
});