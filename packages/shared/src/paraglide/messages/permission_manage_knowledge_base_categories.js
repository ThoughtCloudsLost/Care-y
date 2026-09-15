/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Knowledge_Base_CategoriesInputs */

const en_permission_manage_knowledge_base_categories = /** @type {(inputs: Permission_Manage_Knowledge_Base_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organise the knowledge base`)
};

const es_permission_manage_knowledge_base_categories = /** @type {(inputs: Permission_Manage_Knowledge_Base_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organizar la base de conocimiento`)
};

/**
* | output |
* | --- |
* | "Organise the knowledge base" |
*
* @param {Permission_Manage_Knowledge_Base_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_knowledge_base_categories = /** @type {((inputs?: Permission_Manage_Knowledge_Base_CategoriesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Knowledge_Base_CategoriesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_knowledge_base_categories(inputs)
	return en_permission_manage_knowledge_base_categories(inputs)
});