/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Mgr_Ops_Queue_DepthInputs */

const en_mgr_ops_queue_depth = /** @type {(inputs: Mgr_Ops_Queue_DepthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} open`)
};

const es_mgr_ops_queue_depth = /** @type {(inputs: Mgr_Ops_Queue_DepthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} abiertos`)
};

const en_xa2_mgr_ops_queue_depth = /** @type {(inputs: Mgr_Ops_Queue_DepthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} òpèn ••⟧`)
};

/**
* | output |
* | --- |
* | "{count} open" |
*
* @param {Mgr_Ops_Queue_DepthInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_ops_queue_depth = /** @type {((inputs: Mgr_Ops_Queue_DepthInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Ops_Queue_DepthInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mgr_ops_queue_depth(inputs)
	if (locale === "en-XA") return en_xa2_mgr_ops_queue_depth(inputs)
	return en_mgr_ops_queue_depth(inputs)
});