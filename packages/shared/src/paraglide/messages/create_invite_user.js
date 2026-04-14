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

/**
* | output |
* | --- |
* | "Invite User" |
*
* @param {Create_Invite_UserInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_invite_user = /** @type {((inputs?: Create_Invite_UserInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_Invite_UserInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_create_invite_user(inputs)
	return es_create_invite_user(inputs)
});