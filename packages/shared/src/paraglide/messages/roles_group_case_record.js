/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_Case_RecordInputs */

const en_roles_group_case_record = /** @type {(inputs: Roles_Group_Case_RecordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The case record`)
};

const es_roles_group_case_record = /** @type {(inputs: Roles_Group_Case_RecordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El expediente del caso`)
};

/**
* | output |
* | --- |
* | "The case record" |
*
* @param {Roles_Group_Case_RecordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_case_record = /** @type {((inputs?: Roles_Group_Case_RecordInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_Case_RecordInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_case_record(inputs)
	return en_roles_group_case_record(inputs)
});