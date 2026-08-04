/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Knowledge_Base_CategoriesInputs */

const en_permission_manage_knowledge_base_categories = /** @type {(inputs: Permission_Manage_Knowledge_Base_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage knowledge base categories`)
};

const es_permission_manage_knowledge_base_categories = /** @type {(inputs: Permission_Manage_Knowledge_Base_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar categorías de base de conocimiento`)
};

/**
* | output |
* | --- |
* | "Manage knowledge base categories" |
*
* @param {Permission_Manage_Knowledge_Base_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_knowledge_base_categories = /** @type {((inputs?: Permission_Manage_Knowledge_Base_CategoriesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Knowledge_Base_CategoriesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_manage_knowledge_base_categories(inputs)
	return es_permission_manage_knowledge_base_categories(inputs)
});