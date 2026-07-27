/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Client_Merge_Select_PromptInputs */

const en_client_merge_select_prompt = /** @type {(inputs: Client_Merge_Select_PromptInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Select which ${i?.client} survives:`)
};

const es_client_merge_select_prompt = /** @type {(inputs: Client_Merge_Select_PromptInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Seleccione cual ${i?.client} sobrevive:`)
};

/**
* | output |
* | --- |
* | "Select which {client} survives:" |
*
* @param {Client_Merge_Select_PromptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_select_prompt = /** @type {((inputs: Client_Merge_Select_PromptInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Select_PromptInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_select_prompt(inputs)
	return es_client_merge_select_prompt(inputs)
});