/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_People_BodyInputs */

const en_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The group gives access to the user roster, queue management and the client list. The roster requires Manage users, queue management requires Manage queues, and the client list requires View clients. A user who holds none of the three never sees the group. [[#permissions]]
**What is encrypted behind each one?** The browser decrypts account display names and queue names from organization-key ciphertext. A client's alias is encrypted the same way. The client's phone number and email address sit under the server's operational key instead. [Client management](#admin-people/clients) covers that split. [[#encryption #client-data]]
**Why can a count be missing?** The active-account count and the queue count come from a single query that requires the Manage roles permission. A user admitted to the group through one of the other permissions alone reaches that section but receives no count for it. [The permission system](#deep-dive/the-permission-system) covers how those checks work. [[#permissions #metadata]]`)
};

const es_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El grupo da acceso al directorio de usuarios, la gestión de colas y la lista de clientes. El directorio requiere Gestionar usuarios, la gestión de colas requiere Gestionar colas y la lista de clientes requiere Ver clientes. Quien no tenga ninguno de los tres nunca ve el grupo. [[#permissions]]
**¿Qué está cifrado detrás de cada uno?** El navegador descifra los nombres visibles de las cuentas y los nombres de cola a partir de texto cifrado con la clave de la organización. El alias de un cliente se cifra del mismo modo. El número de teléfono y la dirección de correo del cliente se cifran con la clave operativa del servidor. [Gestión de clientes](#admin-people/clients) trata esa separación. [[#encryption #client-data]]
**¿Por qué puede faltar un recuento?** El recuento de cuentas activas y el de colas provienen de una sola consulta que requiere el permiso Gestionar roles. Quien acceda al grupo solo por uno de los otros permisos llega a esa sección pero no recibe ningún recuento. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo se hacen esas comprobaciones. [[#permissions #metadata]]`)
};

const en_xa2_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè gròùp gìvès àccèss tò thè ùsèr ròstèr, qùèùè mànàgèmènt ànd thè clìènt lìst. Thè ròstèr rèqùìrès Mànàgè ùsèrs, qùèùè mànàgèmènt rèqùìrès Mànàgè qùèùès, ànd thè clìènt lìst rèqùìrès Vìèw clìènts. À ùsèr whò hòlds nònè òf thè thrèè nèvèr sèès thè gròùp. [[#pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt ìs èncryptèd bèhìnd èàch ònè? •••••••••••** Thè bròwsèr dècrypts àccòùnt dìsplày nàmès ànd qùèùè nàmès fròm òrgànìzàtìòn-kèy cìphèrtèxt. À clìènt's àlìàs ìs èncryptèd thè sàmè wày. Thè clìènt's phònè nùmbèr ànd èmàìl àddrèss sìt ùndèr thè sèrvèr's òpèràtìònàl kèy ìnstèàd. [Clìènt mànàgèmènt](#àdmìn-pèòplè/clìènts) còvèrs thàt splìt. [[#èncryptìòn #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why càn à còùnt bè mìssìng? •••••••••** Thè àctìvè-àccòùnt còùnt ànd thè qùèùè còùnt còmè fròm à sìnglè qùèry thàt rèqùìrès thè Mànàgè ròlès pèrmìssìòn. À ùsèr àdmìttèd tò thè gròùp thròùgh ònè òf thè òthèr pèrmìssìòns àlònè rèàchès thàt sèctìòn bùt rècèìvès nò còùnt fòr ìt. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw thòsè chècks wòrk. [[#pèrmìssìòns #mètàdàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The group gives access to the user roster, queue management and the client list. The roster requires Manage users, queue management requires Manage queues, a..." |
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