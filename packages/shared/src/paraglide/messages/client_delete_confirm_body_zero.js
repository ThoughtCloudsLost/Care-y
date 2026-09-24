/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown>, tickets: NonNullable<unknown> }} Client_Delete_Confirm_Body_ZeroInputs */

const en_client_delete_confirm_body_zero = /** @type {(inputs: Client_Delete_Confirm_Body_ZeroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Deleting removes the ${i?.client} record, contact information, and portal access (no ${i?.tickets} on file). There is no way to recover deleted data.`)
};

const es_client_delete_confirm_body_zero = /** @type {(inputs: Client_Delete_Confirm_Body_ZeroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Al eliminar se borra el registro del ${i?.client}, la información de contacto y el acceso al portal (no tiene ${i?.tickets}). No hay forma de recuperar los datos eliminados.`)
};

const en_xa2_client_delete_confirm_body_zero = /** @type {(inputs: Client_Delete_Confirm_Body_ZeroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dèlètìng rèmòvès thè  •••••••${i?.client} rècòrd, còntàct ìnfòrmàtìòn, ànd pòrtàl àccèss (nò  ••••••••••••••••${i?.tickets} òn fìlè). Thèrè ìs nò wày tò rècòvèr dèlètèd dàtà. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Deleting removes the {client} record, contact information, and portal access (no {tickets} on file). There is no way to recover deleted data." |
*
* @param {Client_Delete_Confirm_Body_ZeroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_delete_confirm_body_zero = /** @type {((inputs: Client_Delete_Confirm_Body_ZeroInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Delete_Confirm_Body_ZeroInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_delete_confirm_body_zero(inputs)
	if (locale === "en-XA") return en_xa2_client_delete_confirm_body_zero(inputs)
	return en_client_delete_confirm_body_zero(inputs)
});