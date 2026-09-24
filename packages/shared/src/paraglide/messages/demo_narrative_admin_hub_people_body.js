/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_People_BodyInputs */

const en_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The people group holds three destinations, the user roster, queue configuration and the client list, and each one appears for an account holding its own permission. [[#permissions]]
**What is encrypted behind each one.** Display names and queue names are organization-key ciphertext the browser opens. A client's alias is too, while their phone number and email address are encrypted with a key the server holds, because the server is what places the call. [Client management](#admin-people/clients) covers that split. [[#encryption #client-data]]
**Why a count can be absent.** The active user count, the queue count and the other figures on the group come from one status query that runs on Manage roles, so an account admitted by a destination permission alone reaches the destination and is given no figure for it. [The permission system](#deep-dive/the-permission-system) covers how those checks are made. [[#permissions #metadata]]`)
};

const es_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El grupo de personas tiene tres destinos, el directorio de usuarios, la configuración de colas y la lista de clientes, y cada uno aparece para una cuenta que tenga su propio permiso. [[#permissions]]
**Qué está cifrado detrás de cada uno.** Los nombres visibles y los nombres de cola son texto cifrado con la clave de la organización que abre el navegador. El alias de un cliente también lo es, mientras que su número de teléfono y su dirección de correo están cifrados con una clave que tiene el servidor, porque el servidor es quien hace la llamada. [Gestión de clientes](#admin-people/clients) trata esa separación. [[#encryption #client-data]]
**Por qué puede faltar un recuento.** El recuento de cuentas activas, el de colas y las demás cifras del grupo vienen de una sola consulta de estado que depende de Gestionar roles, así que una cuenta admitida solo por el permiso de un destino llega al destino y no recibe ninguna cifra de él. [El sistema de permisos](#deep-dive/the-permission-system) explica cómo se hacen esas comprobaciones. [[#permissions #metadata]]`)
};

const en_xa2_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ùsèr ròstèr, qùèùè cònfìgùràtìòn, ànd clìènt lìst. Ùsèr ìdèntìfìèrs ànd qùèùè nàmès àrè èncryptèd wìth thè òrgànìzàtìòn kèy bèfòrè stòràgè. Clìènt ìdèntìfìèrs àrè èncryptèd sèpàràtèly, ànd fùll còntàct dètàìls àrè gàtèd by thè Vìèw clìènt PÌÌ pèrmìssìòn. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The people group holds three destinations, the user roster, queue configuration and the client list, and each one appears for an account holding its own perm..." |
*
* @param {Demo_Narrative_Admin_Hub_People_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_people_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_People_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_People_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_people_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_hub_people_body(inputs)
	return en_demo_narrative_admin_hub_people_body(inputs)
});