/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Contents_Group_OrgInputs */

const en_demo_contents_group_org = /** @type {(inputs: Demo_Contents_Group_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization`)
};

const es_demo_contents_group_org = /** @type {(inputs: Demo_Contents_Group_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organización`)
};

const en_xa2_demo_contents_group_org = /** @type {(inputs: Demo_Contents_Group_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization" |
*
* @param {Demo_Contents_Group_OrgInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_contents_group_org = /** @type {((inputs?: Demo_Contents_Group_OrgInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Contents_Group_OrgInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_contents_group_org(inputs)
	if (locale === "en-XA") return en_xa2_demo_contents_group_org(inputs)
	return en_demo_contents_group_org(inputs)
});