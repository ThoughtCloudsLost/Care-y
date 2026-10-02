/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Contents_Group_ClientInputs */

const en_demo_contents_group_client = /** @type {(inputs: Demo_Contents_Group_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Client`)
};

const es_demo_contents_group_client = /** @type {(inputs: Demo_Contents_Group_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cliente`)
};

const en_xa2_demo_contents_group_client = /** @type {(inputs: Demo_Contents_Group_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clìènt ••⟧`)
};

/**
* | output |
* | --- |
* | "Client" |
*
* @param {Demo_Contents_Group_ClientInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_contents_group_client = /** @type {((inputs?: Demo_Contents_Group_ClientInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Contents_Group_ClientInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_contents_group_client(inputs)
	if (locale === "en-XA") return en_xa2_demo_contents_group_client(inputs)
	return en_demo_contents_group_client(inputs)
});