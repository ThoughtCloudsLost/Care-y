/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ secondaryAlias: NonNullable<unknown>, primaryAlias: NonNullable<unknown>, tickets: NonNullable<unknown> }} Client_Merge_Confirm_BodyInputs */

const en_client_merge_confirm_body = /** @type {(inputs: Client_Merge_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.secondaryAlias} will be merged into ${i?.primaryAlias}. All ${i?.tickets} from ${i?.secondaryAlias} will move to ${i?.primaryAlias}. This can be undone.`)
};

const es_client_merge_confirm_body = /** @type {(inputs: Client_Merge_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.secondaryAlias} sera fusionado en ${i?.primaryAlias}. Todos los ${i?.tickets} de ${i?.secondaryAlias} se moveran a ${i?.primaryAlias}. Esto se puede deshacer.`)
};

/**
* | output |
* | --- |
* | "{secondaryAlias} will be merged into {primaryAlias}. All {tickets} from {secondaryAlias} will move to {primaryAlias}. This can be undone." |
*
* @param {Client_Merge_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_confirm_body = /** @type {((inputs: Client_Merge_Confirm_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Confirm_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_confirm_body(inputs)
	return es_client_merge_confirm_body(inputs)
});