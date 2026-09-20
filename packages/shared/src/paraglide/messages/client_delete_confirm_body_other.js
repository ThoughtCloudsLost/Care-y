/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown>, count: NonNullable<unknown>, tickets: NonNullable<unknown> }} Client_Delete_Confirm_Body_OtherInputs */

const en_client_delete_confirm_body_other = /** @type {(inputs: Client_Delete_Confirm_Body_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Permanently deletes the ${i?.client}, their ${i?.count} ${i?.tickets}, and all associated messages, notes, recordings, and attachments. There is no way to recover deleted data.`)
};

const es_client_delete_confirm_body_other = /** @type {(inputs: Client_Delete_Confirm_Body_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Elimina permanentemente al ${i?.client}, sus ${i?.count} ${i?.tickets} y todos los mensajes, notas, grabaciones y archivos adjuntos asociados. No hay forma de recuperar los datos eliminados.`)
};

const en_xa2_client_delete_confirm_body_other = /** @type {(inputs: Client_Delete_Confirm_Body_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Pèrmànèntly dèlètès thè  ••••••••${i?.client}, thèìr  •••${i?.count}  •${i?.tickets}, ànd àll àssòcìàtèd mèssàgès, nòtès, rècòrdìngs, ànd àttàchmènts. Thèrè ìs nò wày tò rècòvèr dèlètèd dàtà. •••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Permanently deletes the {client}, their {count} {tickets}, and all associated messages, notes, recordings, and attachments. There is no way to recover delete..." |
*
* @param {Client_Delete_Confirm_Body_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_delete_confirm_body_other = /** @type {((inputs: Client_Delete_Confirm_Body_OtherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Delete_Confirm_Body_OtherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_delete_confirm_body_other(inputs)
	if (locale === "en-XA") return en_xa2_client_delete_confirm_body_other(inputs)
	return en_client_delete_confirm_body_other(inputs)
});