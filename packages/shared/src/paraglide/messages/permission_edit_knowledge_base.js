/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Edit_Knowledge_BaseInputs */

const en_permission_edit_knowledge_base = /** @type {(inputs: Permission_Edit_Knowledge_BaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit knowledge base`)
};

const es_permission_edit_knowledge_base = /** @type {(inputs: Permission_Edit_Knowledge_BaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar base de conocimiento`)
};

/**
* | output |
* | --- |
* | "Edit knowledge base" |
*
* @param {Permission_Edit_Knowledge_BaseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_edit_knowledge_base = /** @type {((inputs?: Permission_Edit_Knowledge_BaseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Edit_Knowledge_BaseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_edit_knowledge_base(inputs)
	return es_permission_edit_knowledge_base(inputs)
});