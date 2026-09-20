/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Knowledge_Base_CategoriesInputs */

const en_permission_manage_knowledge_base_categories = /** @type {(inputs: Permission_Manage_Knowledge_Base_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage knowledge base categories`)
};

const es_permission_manage_knowledge_base_categories = /** @type {(inputs: Permission_Manage_Knowledge_Base_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar categorías de la base de conocimiento`)
};

const en_xa2_permission_manage_knowledge_base_categories = /** @type {(inputs: Permission_Manage_Knowledge_Base_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè knòwlèdgè bàsè càtègòrìès ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage knowledge base categories" |
*
* @param {Permission_Manage_Knowledge_Base_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_knowledge_base_categories = /** @type {((inputs?: Permission_Manage_Knowledge_Base_CategoriesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Knowledge_Base_CategoriesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_knowledge_base_categories(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_knowledge_base_categories(inputs)
	return en_permission_manage_knowledge_base_categories(inputs)
});