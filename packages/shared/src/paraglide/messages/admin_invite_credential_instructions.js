/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteer: NonNullable<unknown> }} Admin_Invite_Credential_InstructionsInputs */

const en_admin_invite_credential_instructions = /** @type {(inputs: Admin_Invite_Credential_InstructionsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Share these credentials securely with the new ${i?.volunteer}. This is the only time they will be shown.`)
};

const es_admin_invite_credential_instructions = /** @type {(inputs: Admin_Invite_Credential_InstructionsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Comparta estas credenciales de forma segura con el nuevo ${i?.volunteer}. Esta es la única vez que se mostraran.`)
};

const en_xa2_admin_invite_credential_instructions = /** @type {(inputs: Admin_Invite_Credential_InstructionsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Shàrè thèsè crèdèntìàls sècùrèly wìth thè nèw  ••••••••••••••${i?.volunteer}. Thìs ìs thè ònly tìmè thèy wìll bè shòwn. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Share these credentials securely with the new {volunteer}. This is the only time they will be shown." |
*
* @param {Admin_Invite_Credential_InstructionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_instructions = /** @type {((inputs: Admin_Invite_Credential_InstructionsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_InstructionsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_credential_instructions(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_credential_instructions(inputs)
	return en_admin_invite_credential_instructions(inputs)
});