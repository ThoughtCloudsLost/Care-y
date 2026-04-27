/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Block_ButtonInputs */

const en_admin_blocklist_block_button = /** @type {(inputs: Admin_Blocklist_Block_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Block`)
};

const es_admin_blocklist_block_button = /** @type {(inputs: Admin_Blocklist_Block_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloquear`)
};

/**
* | output |
* | --- |
* | "Block" |
*
* @param {Admin_Blocklist_Block_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_block_button = /** @type {((inputs?: Admin_Blocklist_Block_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Block_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blocklist_block_button(inputs)
	return es_admin_blocklist_block_button(inputs)
});