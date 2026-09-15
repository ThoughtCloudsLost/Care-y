/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_Knowledge_BaseInputs */

const en_roles_group_knowledge_base = /** @type {(inputs: Roles_Group_Knowledge_BaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Knowledge base`)
};

const es_roles_group_knowledge_base = /** @type {(inputs: Roles_Group_Knowledge_BaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Base de conocimiento`)
};

/**
* | output |
* | --- |
* | "Knowledge base" |
*
* @param {Roles_Group_Knowledge_BaseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_knowledge_base = /** @type {((inputs?: Roles_Group_Knowledge_BaseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_Knowledge_BaseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_knowledge_base(inputs)
	return en_roles_group_knowledge_base(inputs)
});