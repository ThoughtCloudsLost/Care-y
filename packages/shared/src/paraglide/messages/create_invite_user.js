/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Create_Invite_UserInputs */

const en_create_invite_user = /** @type {(inputs: Create_Invite_UserInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite User`)
};

const es_create_invite_user = /** @type {(inputs: Create_Invite_UserInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitar Usuario`)
};

const en_xa2_create_invite_user = /** @type {(inputs: Create_Invite_UserInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè Ùsèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Invite User" |
*
* @param {Create_Invite_UserInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const create_invite_user = /** @type {((inputs?: Create_Invite_UserInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_Invite_UserInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_create_invite_user(inputs)
	if (locale === "en-XA") return en_xa2_create_invite_user(inputs)
	return en_create_invite_user(inputs)
});